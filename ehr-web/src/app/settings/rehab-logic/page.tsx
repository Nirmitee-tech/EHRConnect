'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Accessibility, Activity,
    Target, ClipboardList, ShieldCheck, ChevronRight,
    Filter, Info, Zap, Database, TrendingUp,
    Heart, Dumbbell, UserCheck, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface RehabRule {
    id: string;
    focusArea: string;
    scoringModel: string;
    targetFrequency: string;
    automation: 'AI-Guided' | 'Manual' | 'Hybrid';
    status: 'Active' | 'Under Review';
}

export default function RehabLogicPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [rules] = useState<RehabRule[]>([
        { id: '1', focusArea: 'Functional Mobility', scoringModel: 'FIM / Barthel Index', targetFrequency: 'Bi-daily', automation: 'AI-Guided', status: 'Active' },
        { id: '2', focusArea: 'Occupational ADL', scoringModel: 'Lawton-Brody Scale', targetFrequency: 'Daily', automation: 'Hybrid', status: 'Active' },
        { id: '3', focusArea: 'Cognitive Rehab', scoringModel: 'MoCA / MMSE', targetFrequency: 'Weekly', automation: 'Manual', status: 'Active' },
        { id: '4', focusArea: 'Post-Stroke Gait', scoringModel: 'Berg Balance Scale', targetFrequency: '3x Weekly', automation: 'Hybrid', status: 'Under Review' },
        { id: '5', focusArea: 'Pain Management', scoringModel: 'VAS / WOMAC', targetFrequency: 'Per Session', automation: 'AI-Guided', status: 'Active' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-emerald-50 rounded-2xl transition-all border border-emerald-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            Rehab Logic
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 ring-1 ring-emerald-500/20">
                                <Accessibility className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">Functional scoring, mobility scales & therapy goal automation</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                        <TrendingUp className="h-4 w-4" />
                        Outcome Analytics
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px] border-none">
                        <Plus className="h-4 w-4" />
                        Configure Rehab Goal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Rehab Scoring Catalog */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Search by focus area, scoring model, or automation level..."
                                className="pl-11 h-12 bg-white border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-emerald-100 p-0 bg-white text-emerald-400">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden border-t-4 border-t-emerald-500">
                        <div className="p-6 bg-emerald-50/20 border-b border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-emerald-600">
                                <Activity className="h-5 w-5" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Therapy Model Registry</h2>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                CARF Accredited Logic
                            </Badge>
                        </div>

                        <div className="divide-y divide-emerald-50">
                            {rules.map((rule) => (
                                <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/50 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                            rule.automation === 'AI-Guided' ? "bg-purple-50 text-purple-600 border-purple-100 font-black" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            {rule.automation === 'AI-Guided' ? <Zap className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{rule.focusArea}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest",
                                                    rule.status === 'Active' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground/40"
                                                )}>
                                                    {rule.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span className="text-emerald-600/70 font-black">{rule.scoringModel}</span>
                                                <div className="w-1 h-1 rounded-full bg-emerald-100" />
                                                <span>Frequency: {rule.targetFrequency}</span>
                                                <div className="w-1 h-1 rounded-full bg-emerald-100" />
                                                <span className="text-purple-600 italic">{rule.automation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">FIM Integrity</div>
                                            <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1.5">
                                                <UserCheck className="h-3 w-3" /> Verified
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-emerald-500/10 transition-colors bg-emerald-50">
                                            <ChevronRight className="h-5 w-5 text-emerald-300 group-hover/item:text-emerald-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Recovery Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/intel border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:rotate-45 transition-transform duration-1000">
                            <Target className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Smart Goals</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-emerald-500/30 pl-4">
                                "Therapy automation triggered for stroke-rehab cohorts. ADL checklist completion rate: 94%."
                            </p>

                            <div className="space-y-6">
                                <RehabMetric label="Mobility Drift" value="Stable" detail="Goal tracking" />
                                <RehabMetric label="Session Yield" value="8.4/10" detail="Mean recovery" />
                                <RehabMetric label="Goal Compliance" value="100%" detail="Audit secure" />
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                Functional Audit Logs
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <ClipboardList className="h-5 w-5" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">ADL Checklist Orchestration</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-100/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Self-Care Logic</span>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-4">v1.2</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-100/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Vitals Sync</span>
                                </div>
                                <Timer className="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            FIM Master Ledger
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RehabMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-emerald-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}
