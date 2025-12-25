'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, ShieldCheck, ThermometerSnowflake,
    Box, ClipboardList, Zap, Database,
    ChevronRight, Gauge, Filter, Info,
    History, Activity, Scissors, Timer, FlaskConical, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SterileTray {
    id: string;
    name: string;
    description: string;
    status: 'Sterile' | 'In-Process' | 'Soiled' | 'Expired';
    lastCycle: string;
    expiry: string;
}

export default function CSSDManagementPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [trays] = useState<SterileTray[]>([
        { id: '1', name: 'Major Ortho Tray #04', description: 'Hip Replace Components', status: 'Sterile', lastCycle: '2h ago', expiry: '2024-06-12' },
        { id: '2', name: 'Cardiac Bypass Set #02', description: 'Vascular Clamps included', status: 'In-Process', lastCycle: 'Cycle #84 (40%)', expiry: '---' },
        { id: '3', name: 'Neuro Spine Kit #12', description: 'Micro-surgical instruments', status: 'Expired', lastCycle: '32d ago', expiry: '2024-03-01' },
        { id: '4', name: 'Emergency C-Section #08', description: 'Standard OB Bundle', status: 'Sterile', lastCycle: '1d ago', expiry: '2024-06-25' },
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
                            {t('settings_registry.cssd.title')}
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 ring-1 ring-emerald-500/20">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.cssd.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                        <History className="h-4 w-4" />
                        Sterile Audit Trail
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Issue Sterility Bolt
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="trays" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-3xl border border-border h-14 w-fit shadow-inner">
                    <TabsTrigger value="trays" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cssd.asset_tracking')}
                    </TabsTrigger>
                    <TabsTrigger value="cycles" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cssd.sterile_cycles')}
                    </TabsTrigger>
                    <TabsTrigger value="indicators" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cssd.biological_indicators')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="trays" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex bg-card p-4 items-center justify-between rounded-3xl border border-border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <LayoutGrid className="h-5 w-5 text-emerald-600" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Asset Catalog (Surgical)</h3>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-5 font-black uppercase tracking-widest">GS1 / UDI Tracking Active</Badge>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-emerald-500">
                                <div className="divide-y divide-border/50">
                                    {trays.map((tray) => (
                                        <div key={tray.id} className="p-6 flex items-center justify-between hover:bg-emerald-500/[0.02] transition-all group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border font-black text-xs",
                                                    tray.status === 'Sterile' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        tray.status === 'In-Process' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                            "bg-red-50 text-red-600 border-red-100"
                                                )}>
                                                    {tray.status.charAt(0)}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{tray.name}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            tray.status === 'Sterile' ? "bg-emerald-500 text-white" :
                                                                tray.status === 'In-Process' ? "bg-blue-500 text-white" : "bg-red-600 text-white"
                                                        )}>
                                                            {tray.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                        <span>{tray.description}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        <span>Expiry: {tray.expiry}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Cycle Stamp</div>
                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{tray.lastCycle}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-110 transition-transform duration-1000">
                                    <Timer className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-emerald-300">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Load Performance</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <CssdMetric label="Active Autoclaves" value="4 / 6" detail="Load Efficiency" />
                                        <CssdMetric label="Turnaround TAT" value="1h 42m" detail="Tray Lifecycle" />
                                        <CssdMetric label="Validation Fail" value="0.2%" detail="Biological Logs" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <Scissors className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Surgical Forecast</span>
                                        </div>
                                        <div className="text-2xl font-black text-white tracking-widest">14 <span className="text-xs font-medium text-white/40 uppercase">Trays Required</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="cycles" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-emerald-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <ThermometerSnowflake className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Cycle Orchestration Master</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configure sterilization profiles for Autoclave, Plasma (H2O2), and Ethylene Oxide (EtO). Define temperature, pressure, and duration safety gates for surgical integrity.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-emerald-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Cycle Profiles</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-emerald-600">Calibration Logs</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="indicators" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <IndicatorCard icon={FlaskConical} title="Geobacillus Log" status="Pass" detail="Batch #842 (24h Incubation)" color="emerald" />
                        <IndicatorCard icon={Zap} title="Chemical Integrator" status="Verified" detail="Class 5 / 6 Logic v102" color="blue" />
                        <IndicatorCard icon={ClipboardList} title="Leak Test v2" status="Operational" detail="Cycle Pressure Integrity" color="slate" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CssdMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-emerald-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black ">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function IndicatorCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        slate: "bg-slate-500/10 text-slate-600 border-slate-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
