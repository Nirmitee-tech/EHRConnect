'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Globe2, Activity,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, ShieldPlus, Users, BarChart3,
    LayoutGrid, Target, HeartPulse, Microscope,
    Bell, Map, Share2, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PopCohort {
    id: string;
    title: string;
    size: string;
    risk: 'Low' | 'Moderate' | 'High' | 'Critical';
    trend: 'Rising' | 'Stable' | 'Falling';
    activeCases: number;
}

export default function PopHealthPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [cohorts] = useState<PopCohort[]>([
        { id: '1', title: 'Type 2 Diabetes Registry', size: '14,200', risk: 'High', trend: 'Rising', activeCases: 420 },
        { id: '2', title: 'Hypertension Cohort A', size: '42,100', risk: 'Moderate', trend: 'Stable', activeCases: 1102 },
        { id: '3', title: 'Post-Op Recovery Group', size: '2,100', risk: 'Low', trend: 'Falling', activeCases: 45 },
        { id: '4', title: 'Respiratory Watch', size: '8,420', risk: 'Critical', trend: 'Rising', activeCases: 842 },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-cyan-100 pb-8 text-left">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-cyan-50 rounded-2xl transition-all border border-cyan-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-cyan-400 group-hover:text-cyan-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-cyan-950">
                            {t('settings_registry.pop_health.title')}
                            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-600 ring-1 ring-cyan-500/20 shadow-sm">
                                <Globe2 className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.pop_health.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-cyan-100 text-cyan-600 hover:bg-cyan-50 transition-all shadow-sm">
                        <Map className="h-4 w-4" />
                        Risk Heatmap
                    </Button>
                    <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-cyan-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Create Cohort
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="risk" className="space-y-8">
                <TabsList className="bg-cyan-50/50 p-1.5 rounded-3xl border border-cyan-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="risk" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pop_health.risk_profiling')}
                    </TabsTrigger>
                    <TabsTrigger value="epi" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pop_health.epidemiology')}
                    </TabsTrigger>
                    <TabsTrigger value="outreach" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pop_health.outreach_logic')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="risk" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-cyan-100 shadow-2xl overflow-hidden border-t-4 border-t-cyan-500">
                                <div className="p-6 bg-cyan-50/30 border-b border-cyan-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 flex items-center gap-2">
                                        <ShieldPlus className="h-4 w-4" />
                                        Regional Risk registries
                                    </h2>
                                    <Badge className="bg-cyan-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic">Surveillance Active</Badge>
                                </div>
                                <div className="divide-y divide-cyan-50 text-left">
                                    {cohorts.map((c) => (
                                        <div key={c.id} className="p-8 flex items-center justify-between hover:bg-cyan-50/50 transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.risk === 'Critical' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                        c.risk === 'High' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                            "bg-cyan-50 text-cyan-600 border-cyan-100"
                                                )}>
                                                    {c.title.charAt(0)}
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.title}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.risk === 'Critical' ? "bg-red-500 text-white" :
                                                                c.risk === 'High' ? "bg-orange-500 text-white" : "bg-cyan-500 text-white"
                                                        )}>
                                                            {c.risk}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-cyan-600/70 font-black">Size: {c.size}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-100" />
                                                        <span>Trend: {c.trend}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Active Cases</div>
                                                    <div className="text-[14px] text-cyan-950 font-black uppercase tracking-tighter italic">{c.activeCases}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-cyan-100 group-hover/item:text-cyan-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 text-left">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl text-left">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <Activity className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-cyan-400">
                                        <TrendingUp className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">Vulnerability Metrics</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <PopMetric label="Comorbidity Load" value="4.2" detail="High-Risk Mean" />
                                        <PopMetric label="Adherence Index" value="84.2%" detail="Global Pool" />
                                        <PopMetric label="Screening Logic" value="Active" detail="Maturity: v4" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400">
                                            <Users className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Total Managed Pool</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">142K <span className="text-xs font-medium text-white/40 uppercase">Individuals</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="epi" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-cyan-500">
                        <div className="w-20 h-20 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 shadow-inner">
                            <Microscope className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2 text-center text-left">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight text-center">Global Epidemiology & Disease Registry</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed font-semibold text-center">
                                Configure multi-tier disease tracking logic. Define incubation alerts, spatial clustering thresholds, and automated reporting gates for CDC/WHO compliance and regional health authority sync.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-cyan-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Audit Registry</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-cyan-600">Sync WHO Hub</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="outreach" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <PopCard icon={Bell} title="Outreach Triggers" status="Operational" detail="Patient Engagement" color="cyan" />
                        <PopCard icon={Target} title="Incentive Engine" status="Verified" detail="Reward Logic" color="blue" />
                        <PopCard icon={Share2} title="Provider Mesh" status="Active" detail="Primary Care Sync" color="blue" />
                        <PopCard icon={HeartPulse} title="Wellness Score" status="Level 4" detail="Outcome Index" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PopMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default text-left">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-cyan-400 transition-colors text-left">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: '82%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function PopCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-cyan-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
