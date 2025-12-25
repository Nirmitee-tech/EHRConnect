'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Microscope, FlaskConical,
    ClipboardList, Zap, Database, ChevronRight, Gauge,
    Filter, Info, History, Activity, Microscope as LabIcon,
    Beaker, FileText, LayoutGrid, Award, ShieldCheck,
    Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpecimenCase {
    id: string;
    accessionNum: string;
    patient: string;
    status: 'Grossing' | 'Processing' | 'Staining' | 'Reporting' | 'Finalized';
    urgent: boolean;
    lastActivity: string;
}

export default function PathologyPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [cases] = useState<SpecimenCase[]>([
        { id: '1', accessionNum: 'PATH-24-1025', patient: 'Anonymous P-84', status: 'Grossing', urgent: true, lastActivity: '2m ago' },
        { id: '2', accessionNum: 'PATH-24-1028', patient: 'Anonymous P-12', status: 'Staining', urgent: false, lastActivity: '15m ago' },
        { id: '3', accessionNum: 'PATH-24-1030', patient: 'Anonymous P-44', status: 'Reporting', urgent: false, lastActivity: '1h ago' },
        { id: '4', accessionNum: 'PATH-24-1035', patient: 'Anonymous P-02', status: 'Processing', urgent: true, lastActivity: 'Now' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-purple-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-purple-50 rounded-2xl transition-all border border-purple-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-purple-400 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.pathology.title')}
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 ring-1 ring-purple-500/20 shadow-sm">
                                <Microscope className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.pathology.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-purple-100 text-purple-600 hover:bg-purple-50 transition-all shadow-sm">
                        <Scan className="h-4 w-4" />
                        Accession Scanner
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Log Specimen Case
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="accessioning" className="space-y-8">
                <TabsList className="bg-purple-50/50 p-1.5 rounded-3xl border border-purple-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="accessioning" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pathology.specimen_tracking')}
                    </TabsTrigger>
                    <TabsTrigger value="staining" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pathology.staining_protocols')}
                    </TabsTrigger>
                    <TabsTrigger value="reporting" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.pathology.reporting')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="accessioning" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-purple-100 shadow-2xl overflow-hidden border-t-4 border-t-purple-500 text-left">
                                <div className="p-6 bg-purple-50/30 border-b border-purple-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Active Accession Hub</h2>
                                    <Badge className="bg-purple-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center">Histopath v4.0 Active</Badge>
                                </div>
                                <div className="divide-y divide-purple-50">
                                    {cases.map((c) => (
                                        <div key={c.id} className="p-8 flex items-center justify-between hover:bg-purple-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.urgent ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-purple-50 text-purple-600 border-purple-100"
                                                )}>
                                                    {c.accessionNum.split('-')[2]}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.accessionNum}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.status === 'Finalized' ? "bg-emerald-500 text-white" : "bg-purple-500 text-white"
                                                        )}>
                                                            {c.status}
                                                        </Badge>
                                                        {c.urgent && <Badge className="bg-red-100 text-red-600 border-none text-[8px] h-4 font-black px-2 uppercase tracking-widest">STAT</Badge>}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-purple-600/70 font-black">{c.patient}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-100" />
                                                        <span>Activity: {c.lastActivity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Case Track</div>
                                                    <div className="text-[8px] text-purple-600 font-bold uppercase tracking-widest italic">In Tissue Processor</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-purple-100 group-hover/item:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <FlaskConical className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-purple-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Lab Optimization</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <PathMetric label="Grossing TAT" value="1.4h" detail="Batch Median" />
                                        <PathMetric label="Block Integrity" value="99.9%" detail="Safety Log" />
                                        <PathMetric label="Stain Consistency" value="97%" detail="H&E v2 Logic" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Status</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">CAP <span className="text-xs font-medium text-white/40 uppercase">Accreditation Active</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="staining" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-purple-500">
                        <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 shadow-inner">
                            <FlaskConical className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Staining Protocol Orchestration</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configure automated staining sequences for H&E, IHC, and Special Stains. Define reagent concentrations, incubation times, and quality control gates for diagnostic precision.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-purple-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Protocols</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-purple-600">IHC Antibody Master</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="reporting" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ReportCard icon={FileText} title="Pathology Reports" status="14 Ready" detail="Diagnostic Queue" color="purple" />
                        <ReportCard icon={Award} title="Quality Peer Review" status="Level 4" detail="Internal Audit" color="blue" />
                        <ReportCard icon={LayoutGrid} title="Digital Slide Hub" status="Active" detail="WSI Viewing" color="blue" />
                        <ReportCard icon={Database} title="SNOMED Mapping" status="942 Terms" detail="Synoptic Meta" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PathMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-purple-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '85%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function ReportCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        purple: "bg-purple-500/10 text-purple-600 border-purple-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left border-l-4 border-l-purple-500">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-purple-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
