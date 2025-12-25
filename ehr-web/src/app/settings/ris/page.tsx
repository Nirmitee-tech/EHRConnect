'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Layers, Database,
    Share2, Monitor, Box, ClipboardList, ShieldCheck,
    ChevronRight, Gauge, Filter, Info,
    HardDrive, Network, Radio, Settings2, Link2, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DICOMNode {
    id: string;
    aeTitle: string;
    ipAddress: string;
    port: number;
    description: string;
    status: 'Operational' | 'Testing' | 'Offline';
}

export default function RISConfigPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [nodes] = useState<DICOMNode[]>([
        { id: '1', aeTitle: 'PACS_MAIN_SRV', ipAddress: '10.0.4.152', port: 104, description: 'Central Archive PACS', status: 'Operational' },
        { id: '2', aeTitle: 'MRI_GE_SIGN_1', ipAddress: '10.0.4.200', port: 4006, description: 'MRI Modality Entry', status: 'Operational' },
        { id: '3', aeTitle: 'CT_SIEMENS_F3', ipAddress: '10.0.4.201', port: 4006, description: 'CT Modality Entry', status: 'Testing' },
        { id: '4', aeTitle: 'WORKSTATION_04', ipAddress: '10.0.4.50', port: 11112, description: 'Reporting Station', status: 'Offline' },
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
                            {t('settings_registry.ris.title')}
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 shadow-sm border border-purple-100">
                                <Layers className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.ris.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                        <Network className="h-4 w-4" />
                        Ping Infrastructure
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Register AE Title
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="routing" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-3xl border border-border h-14 w-fit shadow-inner">
                    <TabsTrigger value="routing" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.ris.dicom_routing')}
                    </TabsTrigger>
                    <TabsTrigger value="worklist" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.ris.modality_worklist')}
                    </TabsTrigger>
                    <TabsTrigger value="storage" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.ris.imaging_nodes')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="routing" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex bg-card p-4 items-center justify-between rounded-3xl border border-border shadow-sm">
                                <div className="flex items-center gap-3 font-mono">
                                    <Settings2 className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Established AE Title Nodes</h3>
                                </div>
                                <Badge className="bg-purple-500/10 text-purple-600 border-none text-[8px] h-5 font-black uppercase tracking-widest">HL7 / DICOM v3.0 Compliant</Badge>
                            </div>

                            <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-purple-500">
                                <div className="divide-y divide-border/50">
                                    {nodes.map((node) => (
                                        <div key={node.id} className="p-6 flex items-center justify-between hover:bg-purple-500/[0.02] transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                                    node.status === 'Operational' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                        node.status === 'Testing' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                            "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    <Radio className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight font-mono">{node.aeTitle}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            node.status === 'Operational' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground/40"
                                                        )}>
                                                            {node.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                        <span className="text-purple-600/70">{node.description}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        <span className="font-mono">{node.ipAddress}:{node.port}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <Button variant="ghost" className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-purple-600 hover:bg-purple-50">C-ECHO</Button>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <HardDrive className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Database className="h-5 w-5 text-purple-400" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-300">Storage Performance</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <RisMetric label="Main PACS Free" value="14.2 TB" detail="82% Allocated" />
                                        <RisMetric label="Query Latency" value="112ms" detail="Local LAN Subnet" />
                                        <RisMetric label="Image Throughput" value="84 GB/h" detail="Peak Load" />
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Monitor className="h-4 w-4 text-purple-400" />
                                            <span className="text-[10px] font-bold uppercase text-white/60 text-xs">Diagnostic Stations</span>
                                        </div>
                                        <div className="text-2xl font-black text-white">12 <span className="text-xs font-medium text-white/40">Registered</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="worklist" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-purple-500">
                        <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 shadow-inner">
                            <ClipboardList className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Modality Worklist (MWL) Orchestration</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Sync clinical orders directly to DICOM modalities. Prevent data entry errors by populating patient meta-data automatically on MRI, CT, and Ultrasound consoles.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-purple-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure MWL Keys</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border">HL7 Mapping</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="storage" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StorageNode icon={Server} title="Tier 1: On-Prem" value="88%" type="High Performance" color="purple" />
                        <StorageNode icon={Link2} title="Tier 2: Cloud Sync" value="Backup" type="AWS Glacier" color="blue" />
                        <StorageNode icon={HardDrive} title="Local Buffer" value="2.4TB" type="SSD Cache" color="emerald" />
                        <StorageNode icon={Network} title="VNA Core" value="Active" type="Cross-Vendor" color="orange" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RisMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-purple-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '75%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function StorageNode({ icon: Icon, title, value, type, color }: { icon: any, title: string, value: string, type: string, color: string }) {
    const colors: Record<string, string> = {
        purple: "bg-purple-500/10 text-purple-600 border-purple-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        orange: "bg-orange-500/10 text-orange-600 border-orange-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
                <div className="flex items-end gap-3">
                    <span className="text-2xl font-black text-foreground tracking-tighter">{value}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{type}</p>
            </div>
        </div>
    );
}
