'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Scissors, ShieldCheck,
    Calendar, Users, ChevronRight, Clock, Box,
    Filter, Info, Zap, Database, Hammer,
    ThermometerSnowflake, LayoutGrid, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface TheatreRoom {
    id: string;
    name: string;
    specialty: 'General' | 'Cardiac' | 'Ortho' | 'Neuro' | 'Robotic';
    status: 'Operational' | 'Maintenance' | 'Sterilizing';
    utilization: string;
    nextBlock: string;
}

export default function TheatreConfigPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [rooms] = useState<TheatreRoom[]>([
        { id: '1', name: 'OR Suite 01', specialty: 'Cardiac', status: 'Operational', utilization: '92%', nextBlock: 'Dr. Henderson (08:00)' },
        { id: '2', name: 'OR Suite 02', specialty: 'Neuro', status: 'Sterilizing', utilization: '84%', nextBlock: 'Dr. Vance (10:30)' },
        { id: '3', name: 'OR Suite 03', specialty: 'Robotic', status: 'Operational', utilization: '78%', nextBlock: 'Dr. Chen (09:15)' },
        { id: '4', name: 'OR Suite 04', specialty: 'Ortho', status: 'Maintenance', utilization: '0%', nextBlock: 'N/A' },
        { id: '5', name: 'OR Suite 05', specialty: 'General', status: 'Operational', utilization: '88%', nextBlock: 'Dr. Miller (08:30)' },
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
                            {t('settings_registry.theatre.title')}
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                <Scissors className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.theatre.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent shadow-sm">
                        <Calendar className="h-4 w-4" />
                        {t('settings_registry.theatre.slot_booking')}
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Provision Suite
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Theatre Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                                placeholder="Search by suite, surgeon block, or equipment..."
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-indigo-600/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0 bg-card">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-indigo-500">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Suite Orchestration</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-indigo-600/60 uppercase">Active Turnarounds: 2</span>
                            </div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {rooms.map((room) => (
                                <div key={room.id} className="p-6 flex items-center justify-between hover:bg-indigo-600/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                            room.status === 'Operational' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                room.status === 'Sterilizing' ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                                                    "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            <Scissors className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{room.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest",
                                                    room.specialty === 'Robotic' ? "bg-purple-500 text-white" : "bg-indigo-600 text-white"
                                                )}>
                                                    {room.specialty}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                <span className="text-indigo-600/70">{room.status}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>Utilization: {room.utilization}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span className="text-amber-600/80 italic">{room.nextBlock}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Compliance Grade</div>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: room.status === 'Operational' ? '100%' : '60%' }} />
                                                </div>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Safe</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-indigo-600/20 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Sterile Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/intel border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:rotate-12 transition-transform duration-1000">
                            <ThermometerSnowflake className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">{t('settings_registry.theatre.sterile_cool')}</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-emerald-500/30 pl-4">
                                "Autoclave cycle #842 passed all biological indicators. Instruments prioritized for Cardiac Suite."
                            </p>

                            <div className="space-y-6">
                                <TheatreMetric label="Cooling TAT" value="42m" detail="Avg post-autoclave" />
                                <TheatreMetric label="Conflict Alert" value="0 Active" detail="Equipment status" />
                                <TheatreMetric label="OR Uptime" value="84%" detail="Operational efficiency" />
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                Run Biological Audit
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Timer className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Turnaround Efficiency</h4>
                        </div>

                        <div className="space-y-5">
                            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-[11px] font-black text-indigo-700 uppercase tracking-tight">Setup Optimization</h5>
                                    <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600/20" />
                                </div>
                                <p className="text-[9px] text-muted-foreground leading-normal font-medium">
                                    AI-assisted tray selection based on procedure CPT code and surgeon preference card.
                                </p>
                            </div>
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{t('settings_registry.theatre.conflict_rules')}</h5>
                                    <Hammer className="h-4 w-4 text-slate-500" />
                                </div>
                                <p className="text-[9px] text-muted-foreground leading-normal font-medium">
                                    Auto-block for Robotic Arm v3 overlap across Suites 02 and 03.
                                </p>
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            Preference Cards
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TheatreMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1.5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-default group/metric">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-[13px] font-black text-white group-hover/metric:text-indigo-400 transition-colors font-mono">{value}</span>
            </div>
            <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter opacity-60 group-hover/metric:opacity-100 transition-opacity">{detail}</p>
        </div>
    );
}
