'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Share2, Database,
    ShieldCheck, ClipboardList, Zap, BarChart3,
    ChevronRight, Gauge, Filter, Info,
    Network, ShieldAlert, FileText, Send, RefreshCcw, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClaimBatch {
    id: string;
    payer: string;
    units: number;
    value: string;
    status: 'Transmitted' | 'Scrubbing' | 'Rejected' | 'Ready';
    lastActivity: string;
}

export default function ClaimsExchangePage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [batches] = useState<ClaimBatch[]>([
        { id: '1', payer: 'MetLife Insurance', units: 142, value: '$124,500.00', status: 'Transmitted', lastActivity: '2m ago' },
        { id: '2', payer: 'Blue Cross TPA', units: 84, value: '$62,140.00', status: 'Scrubbing', lastActivity: 'Now' },
        { id: '3', payer: 'Government Health', units: 215, value: '$340,200.00', status: 'Ready', lastActivity: '1h ago' },
        { id: '4', payer: 'Aetna Global', units: 12, value: '$14,500.00', status: 'Rejected', lastActivity: '4h ago' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-blue-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-blue-50 rounded-2xl transition-all border border-blue-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-blue-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.claims.title')}
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 ring-1 ring-blue-500/20 shadow-sm">
                                <Send className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.claims.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-blue-100 text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                        <RefreshCcw className="h-4 w-4" />
                        EDI Gateway Sync
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Generate Batch
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="gateway" className="space-y-8">
                <TabsList className="bg-blue-50/50 p-1.5 rounded-3xl border border-blue-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="gateway" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.claims.edi_hub')}
                    </TabsTrigger>
                    <TabsTrigger value="scrubbing" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.claims.scrubbing_rules')}
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.claims.rejection_analytics')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="gateway" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl overflow-hidden border-t-4 border-t-blue-500 text-left">
                                <div className="p-6 bg-blue-50/20 border-b border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Network className="h-5 w-5" />
                                        <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Active Transmission Batches</h2>
                                    </div>
                                    <Badge className="bg-blue-500 text-white border-none text-[8px] h-5 font-bold uppercase tracking-widest px-3 leading-none flex items-center">ANSI 837P / 837I Professional</Badge>
                                </div>

                                <div className="divide-y divide-blue-50">
                                    {batches.map((b) => (
                                        <div key={b.id} className="p-8 flex items-center justify-between hover:bg-blue-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-xs font-black",
                                                    b.status === 'Transmitted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        b.status === 'Scrubbing' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                            b.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                                                "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    TRX
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{b.payer}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            b.status === 'Transmitted' ? "bg-emerald-500 text-white" :
                                                                b.status === 'Scrubbing' ? "bg-blue-500 text-white" :
                                                                    b.status === 'Rejected' ? "bg-red-600 text-white" :
                                                                        "bg-slate-500 text-white"
                                                        )}>
                                                            {b.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                        <span className="text-blue-600/70 font-black">{b.units} Claims</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />
                                                        <span className="font-mono">{b.value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Last Ping</div>
                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{b.lastActivity}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-blue-100 group-hover/item:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <BarChart3 className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <Zap className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Scrubbing Performance</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <ClaimMetric label="Scrub Yield" value="98.2%" detail="First Pass" />
                                        <ClaimMetric label="EDI Latency" value="450ms" detail="Gateway Ping" />
                                        <ClaimMetric label="Error Auto-Fix" value="12%" detail="Smart Logic" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Score</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">A+ <span className="text-xs font-medium text-white/40 uppercase">HIPAA / ASCA</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="scrubbing" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-blue-500">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                            <ShieldAlert className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Claim Scrubbing Logic Engine</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configure front-end validation rules to catch missing ICD-10 codes, invalid NPIs, and modifier inconsistencies before transmission to clearinghouses.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-blue-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Scrub Rules</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-blue-600">Import CCI Edits</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DenialCard icon={ShieldAlert} title="Missing Data Denials" rate="4.2%" trend="Down 1.2%" color="blue" />
                        <DenialCard icon={FileText} title="Coding Errors" rate="2.1%" trend="Up 0.4%" color="red" />
                        <DenialCard icon={Landmark} title="Payer Logic Mismatch" rate="5.4%" trend="Stable" color="amber" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ClaimMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-blue-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '92%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function DenialCard({ icon: Icon, title, rate, trend, color }: { icon: any, title: string, rate: string, trend: string, color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        red: "bg-red-500/10 text-red-600 border-red-100",
        amber: "bg-amber-500/10 text-amber-600 border-amber-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
                <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-black text-foreground">{rate}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{trend}</span>
                </div>
            </div>
        </div>
    );
}
