'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Activity, Heart,
    Wind, ShieldPlus, Zap, ClipboardList, Database,
    ChevronRight, Gauge, Filter, Info,
    BarChart3, RefreshCcw, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface AcuityModel {
    id: string;
    name: string;
    category: 'Acute Physiology' | 'Organ Dysfunction' | 'Nursing Workload';
    parameters: number;
    updateFrequency: string;
    autoCalculation: boolean;
    status: 'Operational' | 'Testing' | 'Disabled';
}

export default function ICUAcuityPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [models] = useState<AcuityModel[]>([
        { id: '1', name: 'APACHE II', category: 'Acute Physiology', parameters: 12, updateFrequency: '24h', autoCalculation: true, status: 'Operational' },
        { id: '2', name: 'SOFA Score', category: 'Organ Dysfunction', parameters: 6, updateFrequency: '1h', autoCalculation: true, status: 'Operational' },
        { id: '3', name: 'SAPS II', category: 'Acute Physiology', parameters: 17, updateFrequency: '24h', autoCalculation: true, status: 'Testing' },
        { id: '4', name: 'TISS-28', category: 'Nursing Workload', parameters: 28, updateFrequency: 'Shift-wise', autoCalculation: false, status: 'Operational' },
        { id: '5', name: 'MEWS (Pediatric)', category: 'Acute Physiology', parameters: 5, updateFrequency: 'Real-time', autoCalculation: true, status: 'Operational' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 bg-slate-950/20 rounded-[3rem]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-slate-900/50 hover:bg-slate-800 rounded-2xl transition-all border border-white/5 group shadow-xl"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
                            {t('settings_registry.icu.title')}
                            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 ring-1 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                <Activity className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-slate-400 font-semibold mt-1.5 opacity-80">{t('settings_registry.icu.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-white/10 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                        <Monitor className="h-4 w-4" />
                        {t('settings_registry.icu.monitor_refresh')}
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all hover:translate-y-[-2px] border-none">
                        <Plus className="h-4 w-4" />
                        New Acuity Model
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Models Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Search math models (APACHE, SAPS, ARDS)..."
                                className="pl-11 h-12 bg-slate-900/50 border-white/5 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-white placeholder:text-slate-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 p-0 bg-slate-900/50 text-slate-400">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
                        <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t('settings_registry.icu.scoring_models')}</h2>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                Predictive Performance: High
                            </Badge>
                        </div>

                        <div className="divide-y divide-white/5">
                            {models.map((model) => (
                                <div key={model.id} className="p-6 flex items-center justify-between hover:bg-blue-500/[0.03] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border border-white/10",
                                            model.status === 'Operational' ? "bg-emerald-500/10 text-emerald-400" :
                                                model.status === 'Testing' ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-500"
                                        )}>
                                            <Gauge className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-white tracking-tight">{model.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest",
                                                    model.status === 'Operational' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                                                )}>
                                                    {model.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="text-blue-400 opacity-60">{model.category}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <span>{model.parameters} Input Variables</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <span>Refresh: {model.updateFrequency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-white/50 tracking-wider uppercase">Real-time Pipeline</div>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="text-[8px] font-bold text-emerald-400 uppercase">{model.autoCalculation ? 'Auto-Calc Active' : 'Manual Review'}</span>
                                                <div className={cn("w-2 h-2 rounded-full", model.autoCalculation ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700")} />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-blue-500/20 transition-colors bg-white/5 border border-white/5">
                                            <ChevronRight className="h-5 w-5 text-slate-500 group-hover/item:text-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Hemodynamic Control */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/hemo shadow-3xl backdrop-blur-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/hemo:scale-110 transition-transform duration-1000">
                            <Heart className="h-32 w-32 text-red-500" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <RefreshCcw className="h-5 w-5 text-blue-400 animate-spin-slow" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Waveform Engine</h3>
                            </div>

                            <div className="space-y-6">
                                <ICUMetric label="Central Map" value="78" detail="Optimal Range" color="emerald" />
                                <ICUMetric label="SVR Calc" value="1240" detail="Calculated 2m ago" color="blue" />
                                <ICUMetric label="Cardiac Index" value="2.8" detail="Flow Dynamic" color="purple" />
                            </div>

                            <div className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 mt-4">
                                <div className="h-10 w-1 bg-blue-500 rounded-full" />
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                                    "High-frequency data streaming is currently ACTIVE for Bed 101-112. Sampling rate: 256Hz."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900 opacity-90 border border-white/5 rounded-[2.5rem] shadow-xl space-y-6 relative group/vent overflow-hidden backdrop-blur-2xl">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Wind className="h-5 w-5" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('settings_registry.icu.vent_protocols')}</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover/vent:border-blue-500/30 transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weaning Trials</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] h-4">SBT Logic</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover/vent:border-blue-500/30 transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ARDS Net Support</span>
                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] h-4">v6.2</Badge>
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl mt-4">
                            <Database className="h-4 w-4" />
                            Variable Mapping
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ICUMetric({ label, value, detail, color }: { label: string, value: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        purple: "text-purple-400"
    };

    return (
        <div className="flex justify-between items-center group/m cursor-default">
            <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover/m:text-white transition-colors">{label}</div>
                <div className="text-[8px] font-medium text-slate-600 uppercase tracking-tighter">{detail}</div>
            </div>
            <div className={cn("text-xl font-black tracking-tighter", colors[color])}>{value}</div>
        </div>
    );
}
