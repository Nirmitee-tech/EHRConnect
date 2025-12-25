'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Microscope, Activity,
    Share2, Database, Zap, ClipboardList, ShieldCheck,
    ChevronRight, Gauge, Filter, Info,
    RefreshCcw, Monitor, Cpu, FlaskConical, Timer, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Analyzer {
    id: string;
    name: string;
    model: string;
    status: 'Online' | 'Offline' | 'Error';
    lastSync: string;
    port: string;
}

export default function LISManagementPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [analyzers] = useState<Analyzer[]>([
        { id: '1', name: 'Hematology-Alpha', model: 'Sysmex XN-1000', status: 'Online', lastSync: '2s ago', port: 'COM3 / HL7 v2.5' },
        { id: '2', name: 'Biochem-Beta', model: 'Roche Cobas 6000', status: 'Online', lastSync: '15s ago', port: '192.168.1.45:8080' },
        { id: '3', name: 'Immuno-Gamma', model: 'Abbott Alinity', status: 'Error', lastSync: '1h ago', port: 'COM7 / ASTM' },
        { id: '4', name: 'Urinalysis-Delta', model: 'Beckman Coulter', status: 'Offline', lastSync: '2d ago', port: 'COM1' },
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
                            {t('settings_registry.lis.title')}
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                                <Microscope className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.lis.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                        <RefreshCcw className="h-4 w-4" />
                        Sync All Nodes
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Configure Analyzer
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="analyzers" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-3xl border border-border h-14 w-fit shadow-inner">
                    <TabsTrigger value="analyzers" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.lis.analyzer_interfacing')}
                    </TabsTrigger>
                    <TabsTrigger value="validation" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.lis.result_validation')}
                    </TabsTrigger>
                    <TabsTrigger value="tat" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.lis.tat_benchmarks')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analyzers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex bg-card p-4 items-center justify-between rounded-3xl border border-border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Interfacing Drivers</h3>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-5 font-black uppercase tracking-widest">HL7 / ASTM Native</Badge>
                            </div>

                            <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-blue-500">
                                <div className="divide-y divide-border/50">
                                    {analyzers.map((az) => (
                                        <div key={az.id} className="p-6 flex items-center justify-between hover:bg-blue-500/[0.02] transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                                    az.status === 'Online' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        az.status === 'Error' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                            "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    <Monitor className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{az.name}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            az.status === 'Online' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground/40"
                                                        )}>
                                                            {az.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                        <span className="text-blue-600/70 font-black">{az.model}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        <span>Port: {az.port}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Last Ping</div>
                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{az.lastSync}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:rotate-12 transition-transform duration-1000">
                                    <FlaskConical className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-400" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Analyzer Stream</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <LisMetric label="Message Queue" value="1,242" detail="Events Today" />
                                        <LisMetric label="Parse Errors" value="0" detail="Global Drifts" />
                                        <LisMetric label="Ack Latency" value="14ms" detail="Avg Response" />
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                        View Error Logs
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="validation" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-blue-500">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Auto-Release Engine</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Define logic gates for automated specimen release. Critically abnormal results are held for manual path-review according to CLIA/CAP guidelines.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-blue-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Logic Gates</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border">Rule Simulation</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tat" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TatCard icon={Timer} title="STAT Turnaround" value="45m" target="< 60m" color="red" />
                        <TatCard icon={Timer} title="Routine Turnaround" value="4.2h" target="< 6h" color="blue" />
                        <TatCard icon={BarChart3} title="Pathologist Review" value="1.8h" target="< 2h" color="emerald" />
                    </div>

                    <div className="p-10 bg-muted/30 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Historical Performance</h4>
                        <div className="w-full h-40 flex items-end gap-2 px-10">
                            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-500/10 rounded-t-xl group/bar relative">
                                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-xl transition-all duration-1000 group-hover/bar:bg-blue-400" style={{ height: `${h}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LisMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-blue-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25">{detail}</span>
            </div>
        </div>
    );
}

function TatCard({ icon: Icon, title, value, target, color }: { icon: any, title: string, value: string, target: string, color: string }) {
    const colors: Record<string, string> = {
        red: "bg-red-500/10 text-red-600 border-red-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className={cn("bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all")}>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
                <div className="flex items-end gap-3">
                    <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 mb-1.5 uppercase">Target {target}</span>
                </div>
            </div>
        </div>
    );
}
