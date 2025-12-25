'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Calendar, Users,
    History, Clock, ClipboardList, Zap, Database,
    ChevronRight, Gauge, Filter, Info,
    Timer, UserCheck, Activity, LayoutGrid, Award, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffShift {
    id: string;
    unit: string;
    staffingLevel: string;
    status: 'Optimal' | 'Critical' | 'Drafting';
    pattern: string;
    assigned: number;
    required: number;
}

export default function RosteringPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [shifts] = useState<StaffShift[]>([
        { id: '1', unit: 'ICU - Main Subnet', staffingLevel: 'Acuity Level 4', status: 'Optimal', pattern: '7-on / 7-off', assigned: 12, required: 12 },
        { id: '2', unit: 'Emergency Dept', staffingLevel: 'Surge Protocol', status: 'Critical', pattern: '8h Rotating', assigned: 8, required: 14 },
        { id: '3', unit: 'Maternity Ward', staffingLevel: 'Baseline', status: 'Optimal', pattern: '12h Continental', assigned: 6, required: 6 },
        { id: '4', unit: 'General Surgery', staffingLevel: 'Standard', status: 'Drafting', pattern: 'Fixed Days', assigned: 4, required: 10 },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-rose-50 rounded-2xl transition-all border border-rose-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-rose-400 group-hover:text-rose-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.rostering.title')}
                            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 ring-1 ring-rose-500/20 shadow-sm">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.rostering.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
                        <History className="h-4 w-4" />
                        Historical Patterns
                    </Button>
                    <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Auto-Generate Roster
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="patterns" className="space-y-8">
                <TabsList className="bg-rose-50/50 p-1.5 rounded-3xl border border-rose-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="patterns" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.rostering.shift_patterns')}
                    </TabsTrigger>
                    <TabsTrigger value="skillmix" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.rostering.skill_mix')}
                    </TabsTrigger>
                    <TabsTrigger value="oncall" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.rostering.on_call')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="patterns" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl overflow-hidden border-t-4 border-t-rose-500 text-left">
                                <div className="p-6 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Unit Staffing Orchestration</h2>
                                    <Badge className="bg-rose-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center">Acuity-Integrated v3.2</Badge>
                                </div>
                                <div className="divide-y divide-rose-50">
                                    {shifts.map((s) => (
                                        <div key={s.id} className="p-8 flex items-center justify-between hover:bg-rose-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                                    s.status === 'Optimal' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        s.status === 'Critical' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                            "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{s.unit}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            s.status === 'Optimal' ? "bg-emerald-500 text-white" :
                                                                s.status === 'Critical' ? "bg-red-600 text-white" :
                                                                    "bg-amber-500 text-white"
                                                        )}>
                                                            {s.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-rose-600/70 font-black">{s.pattern}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-100" />
                                                        <span>{s.staffingLevel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Fill Rate</div>
                                                    <div className="text-[14px] text-foreground font-black uppercase tracking-tighter">
                                                        {s.assigned} <span className="text-muted-foreground/40 text-[10px] font-medium italic">/ {s.required}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-rose-100 group-hover/item:text-rose-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <Clock className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-rose-400">
                                        <Timer className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Operational Readiness</h3>
                                    </div>
                                    <div className="space-y-6 text-left">
                                        <RosterMetric label="Staff Utilization" value="84.2%" detail="Global Mean" />
                                        <RosterMetric label="Overtime Impact" value="12%" detail="Budget Drift" />
                                        <RosterMetric label="Skills Compliance" value="99.8%" detail="Registry Sync" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                                            <UserCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Active On-Duty</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">142 <span className="text-xs font-medium text-white/40 uppercase">Clinicians</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="skillmix" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-rose-500">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
                            <Award className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Acuity-based Skill-Mix Engine</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Define minimum clinical competencies for unit assignment. Auto-calculate required staffing based on real-time patient acuity scores (APACHE, ESI) and ward occupancy.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-rose-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Skill Sets</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-rose-600">Acuity Mapping</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="oncall" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <UnitCard icon={Activity} title="Cardiology On-Call" status="Dr. Smith" detail="Main Campus" color="red" />
                        <UnitCard icon={LayoutGrid} title="Trauma Deck" status="Dr. Miller" detail="ER Subnet" color="rose" />
                        <UnitCard icon={Clock} title="Paeds Registrar" status="Dr. Lee" detail="NICU Wing" color="blue" />
                        <UnitCard icon={ShieldCheck} title="Ops Administrator" status="S. Johnson" detail="Facility Global" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RosterMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-rose-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '80%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function UnitCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        rose: "bg-rose-500/10 text-rose-600 border-rose-100",
        red: "bg-red-500/10 text-red-600 border-red-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
