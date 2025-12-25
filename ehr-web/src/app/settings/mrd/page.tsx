'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, FolderOpen, Files,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, Activity, ShieldCheck,
    ClipboardList, LayoutGrid, ScrollText,
    UserSearch, FileClock, HardDrive, Lock,
    Printer, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArchiveCase {
    id: string;
    mrn: string;
    patient: string;
    type: 'Inpatient' | 'Outpatient' | 'Emergency';
    status: 'Inbound' | 'Archived' | 'Coding' | 'ROI Pending';
    lastUpdated: string;
}

export default function MRDPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [cases] = useState<ArchiveCase[]>([
        { id: '1', mrn: 'MRN-2024-8842', patient: 'Anonymous P-24', type: 'Inpatient', status: 'Inbound', lastUpdated: '14m ago' },
        { id: '2', mrn: 'MRN-2024-1102', patient: 'Anonymous P-02', type: 'Outpatient', status: 'Archived', lastUpdated: '2d ago' },
        { id: '3', mrn: 'MRN-2024-9042', patient: 'Anonymous P-55', type: 'Emergency', status: 'Coding', lastUpdated: '1h ago' },
        { id: '4', mrn: 'MRN-2024-4421', patient: 'Anonymous P-90', type: 'Inpatient', status: 'ROI Pending', lastUpdated: '5m ago' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8 text-left">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-orange-50 rounded-2xl transition-all border border-orange-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-orange-400 group-hover:text-orange-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-orange-950">
                            {t('settings_registry.mrd.title')}
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600 ring-1 ring-orange-500/20 shadow-sm">
                                <FolderOpen className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.mrd.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-orange-100 text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
                        <Share2 className="h-4 w-4" />
                        ROI Gateway
                    </Button>
                    <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Log New Archive
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="archival" className="space-y-8">
                <TabsList className="bg-orange-50/50 p-1.5 rounded-3xl border border-orange-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="archival" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.mrd.archival_logic')}
                    </TabsTrigger>
                    <TabsTrigger value="roi" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.mrd.request_queue')}
                    </TabsTrigger>
                    <TabsTrigger value="coding" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.mrd.coding_audit')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="archival" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-2xl overflow-hidden border-t-4 border-t-orange-500">
                                <div className="p-6 bg-orange-50/30 border-b border-orange-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
                                        <HardDrive className="h-4 w-4" />
                                        Health Information Registry
                                    </h2>
                                    <Badge className="bg-orange-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic text-center">HIPAA Compliant Vault</Badge>
                                </div>
                                <div className="divide-y divide-orange-50">
                                    {cases.map((c) => (
                                        <div key={c.id} className="p-8 flex items-center justify-between hover:bg-orange-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.status === 'Archived' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        c.status === 'ROI Pending' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                            "bg-orange-50 text-orange-600 border-orange-100"
                                                )}>
                                                    MRD
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.mrn}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.status === 'Archived' ? "bg-emerald-500 text-white" :
                                                                c.status === 'ROI Pending' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                                                        )}>
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-orange-600/70 font-black">{c.patient}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-100" />
                                                        <span>Type: {c.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Modified</div>
                                                    <div className="text-[8px] text-orange-600 font-bold uppercase tracking-widest italic">{c.lastUpdated}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-orange-100 group-hover/item:text-orange-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl text-left">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <Files className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-orange-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-300">Archival Metrics</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <MrdMetric label="Chart-to-Archive" value="4h" detail="Outbound Median" />
                                        <MrdMetric label="Coding Accuracy" value="97.4%" detail="Compliance Log" />
                                        <MrdMetric label="Digital Ratio" value="99.2%" detail="Vault Hybridity" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-orange-400">
                                            <Lock className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Audit Status</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">CLEAR <span className="text-xs font-medium text-white/40 uppercase">AHRQ Compliant</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="roi" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-orange-500">
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-600 shadow-inner">
                            <UserSearch className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Release of Information Hub</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Manage and track external health record requests from patients, insurance payers, and legal entities. Configure automated authorization verification and record bundling logic.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-orange-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Process Requests</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-orange-600">Auth Templates</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="coding" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <MrdCard icon={ScrollText} title="ICD-10 / CPT Audit" status="Operational" detail="HIM Accuracy" color="orange" />
                        <MrdCard icon={FileClock} title="Late Entry Monitor" status="Verified" detail="Drift Prevention" color="blue" />
                        <MrdCard icon={Printer} title="Discharge Bundles" status="Active" detail="Patient Portals" color="blue" />
                        <MrdCard icon={ShieldCheck} title="Privacy Logs" status="Level 4" detail="Access Control" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MrdMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default text-left">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-orange-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: '88%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function MrdCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        orange: "bg-orange-500/10 text-orange-600 border-orange-100",
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
                    <span className="text-sm font-black text-orange-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
