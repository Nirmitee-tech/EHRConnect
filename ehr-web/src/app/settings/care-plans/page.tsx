'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Workflow, Target,
    TrendingUp, Calendar, ClipboardList, Filter,
    ChevronRight, Zap, Info, Database, Heart,
    CheckCircle2, Layers, Map, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface CarePathway {
    id: string;
    name: string;
    diseaseGroup: string;
    milestones: number;
    duration: string;
    enrollmentActive: number;
    outcomeTarget: string;
    status: 'Published' | 'Draft' | 'Under Review';
}

export default function CarePathwaysPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [pathways] = useState<CarePathway[]>([
        { id: '1', name: 'Post-MI Recovery (Standard)', diseaseGroup: 'Cardiology', milestones: 12, duration: '90 Days', enrollmentActive: 452, outcomeTarget: 'RE-ADMISSION < 5%', status: 'Published' },
        { id: '2', name: 'Type-2 Diabetes Management', diseaseGroup: 'Endocrine', milestones: 8, duration: 'Longitudinal', enrollmentActive: 1240, outcomeTarget: 'HBA1C < 7.0', status: 'Published' },
        { id: '3', name: 'Chronic HP (Sepsis Prevention)', diseaseGroup: 'Critical Care', milestones: 5, duration: '14 Days', enrollmentActive: 28, outcomeTarget: 'SSI < 1%', status: 'Under Review' },
        { id: '4', name: 'Maternal Health Bundle', diseaseGroup: 'OB/GYN', milestones: 15, duration: '270 Days', enrollmentActive: 315, outcomeTarget: 'VAGINAL DELIVERY > 70%', status: 'Published' },
        { id: '5', name: 'Total Hip Arthroplasty', diseaseGroup: 'Orthopedics', milestones: 6, duration: '60 Days', enrollmentActive: 89, outcomeTarget: 'MOBILITY SCALE > 8', status: 'Draft' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
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
                            {t('settings_registry.care_plans.title')}
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Map className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.care_plans.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent ring-primary/5">
                        <TrendingUp className="h-4 w-4" />
                        {t('settings_registry.care_plans.outcomes_tracking')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px]">
                        <Compass className="h-4 w-4" />
                        {t('settings_registry.care_plans.protocol_builder')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Pathway Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search clinical protocols or disease cohorts..."
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0 bg-card">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Workflow className="h-5 w-5 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.care_plans.disease_registry')}</h2>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                2,540 Patients Managed Collectively
                            </Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {pathways.map((path) => (
                                <div key={path.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner",
                                            path.status === 'Published' ? "bg-emerald-50 text-emerald-500" :
                                                path.status === 'Draft' ? "bg-muted text-muted-foreground" : "bg-blue-50 text-blue-500"
                                        )}>
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{path.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest",
                                                    path.status === 'Published' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground/40"
                                                )}>
                                                    {path.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                <span className="text-primary/70">{path.diseaseGroup}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>{path.milestones} Clinical Milestones</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>{path.duration} Cycle</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[11px] font-black text-foreground tracking-wider uppercase">{path.outcomeTarget}</div>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: '65%' }} />
                                                </div>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Target</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-primary/20 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Path Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/intel border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:rotate-45 transition-transform duration-1000">
                            <TrendingUp className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-amber-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Cohort Insights</h3>
                            </div>

                            <div className="space-y-6">
                                <PathwayMetric label="Compliance" value="94.2%" detail="+2.1% this month" />
                                <PathwayMetric label="Outcome Gaps" value="12" detail="High severity focus" />
                                <PathwayMetric label="Automation" value="68%" detail="AI-triggered tasks" />
                            </div>

                            <div className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 mt-4">
                                <Heart className="h-4 w-4 text-red-400 shrink-0" />
                                <p className="text-[10px] text-white/50 leading-relaxed font-medium italic">
                                    "Standardized care pathways have reduced variability in surgery prep by 38% since last quarter."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group/milestone overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.care_plans.milestone_mapping')}</h4>
                        </div>

                        <div className="space-y-4">
                            {[
                                { t: 'Assessment', d: 'Baseline vital intake & diagnostic review' },
                                { t: 'Stabilization', d: 'Medication titration & primary therapy' },
                                { t: 'Discharge Prep', d: 'Home-care orchestration & education' }
                            ].map((m, i) => (
                                <div key={i} className="flex gap-4 group/m transition-all hover:translate-x-1">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-primary/20">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">{m.t}</h5>
                                        <p className="text-[9px] text-muted-foreground font-medium">{m.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full h-11 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            Global Master Sync
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PathwayMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1.5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-default group/metric">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-[13px] font-black text-white group-hover/metric:text-primary transition-colors">{value}</span>
            </div>
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter opacity-60 group-hover/metric:opacity-100 transition-opacity">{detail}</p>
        </div>
    );
}
