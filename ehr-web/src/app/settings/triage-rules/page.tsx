'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Activity, AlertCircle,
    ShieldAlert, Zap, Clock, Users, ChevronRight,
    Filter, Info, ZapOff, Siren, Flame, Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface TriageRule {
    id: string;
    level: 'ESI 1' | 'ESI 2' | 'ESI 3' | 'ESI 4' | 'ESI 5';
    criteria: string;
    resourceRequirement: string;
    maxWaitTime: string;
    autoAlert: boolean;
}

export default function TriageLogicPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [surgeActive, setSurgeActive] = useState(false);

    const [rules] = useState<TriageRule[]>([
        { id: '1', level: 'ESI 1', criteria: 'Imminent death / Cardiac arrest', resourceRequirement: 'Immediate / All staff', maxWaitTime: '0 mins', autoAlert: true },
        { id: '2', level: 'ESI 2', criteria: 'High risk / Altered mental status', resourceRequirement: '2+ Resources', maxWaitTime: '10 mins', autoAlert: true },
        { id: '3', level: 'ESI 3', criteria: 'Stable / Multi-resource needs', resourceRequirement: '2 Resources', maxWaitTime: '30 mins', autoAlert: false },
        { id: '4', level: 'ESI 4', criteria: 'Minor / Single-resource need', resourceRequirement: '1 Resource', maxWaitTime: '60 mins', autoAlert: false },
        { id: '5', level: 'ESI 5', criteria: 'Non-urgent / Prescription refill', resourceRequirement: '0 Resources', maxWaitTime: '120 mins', autoAlert: false },
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
                            {t('settings_registry.triage.title')}
                            <div className="p-2 bg-red-500/10 rounded-xl text-red-600 animate-pulse">
                                <Siren className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.triage.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setSurgeActive(!surgeActive)}
                        variant={surgeActive ? "destructive" : "outline"}
                        className={cn("gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg", surgeActive ? "animate-bounce" : "")}
                    >
                        {surgeActive ? <Flame className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                        {t('settings_registry.triage.surge_protocols')}
                    </Button>
                    <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-red-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.triage.esi_config')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Triage Protocol List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex bg-card p-2 rounded-3xl border border-border shadow-sm">
                        <Button variant="ghost" className="flex-1 rounded-2xl h-11 text-[10px] uppercase font-black tracking-widest bg-muted/50">Severity Mapping</Button>
                        <Button variant="ghost" className="flex-1 rounded-2xl h-11 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Resource Logic</Button>
                        <Button variant="ghost" className="flex-1 rounded-2xl h-11 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Queue Automation</Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-red-500">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-600">
                                <Activity className="h-5 w-5" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">{t('settings_registry.triage.esi_config')}</h2>
                            </div>
                            <Badge className="bg-red-500/10 text-red-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">
                                ESI-v5 Standardized
                            </Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {rules.map((rule) => (
                                <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-red-500/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner",
                                            rule.level.includes('1') ? "bg-red-600 text-white" :
                                                rule.level.includes('2') ? "bg-orange-500 text-white" :
                                                    rule.level.includes('3') ? "bg-yellow-400 text-black" :
                                                        "bg-emerald-500 text-white"
                                        )}>
                                            <span className="text-[10px] font-black">{rule.level}</span>
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{rule.criteria}</h3>
                                                {rule.autoAlert && (
                                                    <Badge className="bg-red-500/10 text-red-600 border-none text-[8px] px-2 h-4 font-black uppercase">Auto-Alert</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                <span className="text-primary/70">{rule.resourceRequirement}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>Max Wait: {rule.maxWaitTime}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Direct Admission</div>
                                            <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest flex items-center justify-end gap-1.5">
                                                <div className={cn("w-2 h-2 rounded-full", rule.autoAlert ? "bg-red-500 animate-ping" : "bg-border")} />
                                                {rule.autoAlert ? 'High Priority' : 'Standard'}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-red-500/20 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-red-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Operational Health */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:rotate-45 transition-transform duration-1000">
                            <Gauge className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-red-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300">Queue Health</h3>
                            </div>

                            <div className="space-y-6">
                                <TriageMetric label="Average D2D" value="14.2m" detail="Door-to-Doctor" />
                                <TriageMetric label="LWBS Rate" value="0.8%" detail="Left Without Being Seen" />
                                <TriageMetric label="Bed TAT" value="48m" detail="Turn-Around Time" />
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-bold uppercase text-white/60">Live ER Census</span>
                                </div>
                                <div className="text-2xl font-black text-white">42 <span className="text-xs font-medium text-white/40">Patients</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-red-600" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.triage.surge_protocols')}</h4>
                        </div>

                        <div className="space-y-4">
                            <SurgeRule label="Level 1: Yellow" detail="30 min delay in non-urgent" active={surgeActive} />
                            <SurgeRule label="Level 2: Orange" detail="Double-occupancy rooms mode" active={surgeActive} />
                            <SurgeRule label="Level 3: Red" detail="Diversion logic activated" active={surgeActive} />
                        </div>

                        <div className="pt-6 border-t border-border">
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                <p className="text-[9px] font-medium text-muted-foreground leading-normal">
                                    Diversion protocols must be re-validated every 4 hours during active surge.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TriageMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-red-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '70%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25">{detail}</span>
            </div>
        </div>
    );
}

function SurgeRule({ label, detail, active }: { label: string, detail: string, active: boolean }) {
    return (
        <div className={cn(
            "p-4 rounded-2xl border transition-all duration-500",
            active ? "bg-red-50 border-red-200" : "bg-muted/30 border-transparent opacity-60 grayscale"
        )}>
            <h5 className={cn("text-[10px] font-black uppercase tracking-tight mb-0.5", active ? "text-red-700" : "text-muted-foreground")}>{label}</h5>
            <p className="text-[9px] font-medium text-muted-foreground leading-normal">{detail}</p>
        </div>
    );
}
