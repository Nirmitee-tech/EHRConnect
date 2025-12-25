'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Wallet, Handshake,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, Activity, ShieldAlert, Scale,
    ClipboardList, BarChart3, LayoutGrid, Gavel,
    UserCheck, FileWarning, HeartHandshake, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CollectionCase {
    id: string;
    account: string;
    patient: string;
    balance: string;
    status: 'Active' | 'Hardship' | 'Legal' | 'Agency';
    daysPastDue: number;
}

export default function CollectionsPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [cases] = useState<CollectionCase[]>([
        { id: '1', account: 'ACC-24-901', patient: 'Anonymous P-12', balance: '$1,200', status: 'Active', daysPastDue: 124 },
        { id: '2', account: 'ACC-24-442', patient: 'Anonymous P-88', balance: '$840', status: 'Hardship', daysPastDue: 92 },
        { id: '3', account: 'ACC-24-102', patient: 'Anonymous P-05', balance: '$12,400', status: 'Legal', daysPastDue: 210 },
        { id: '4', account: 'ACC-24-882', patient: 'Anonymous P-44', balance: '$2,100', status: 'Agency', daysPastDue: 155 },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-100 pb-8 text-left">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-rose-50 rounded-2xl transition-all border border-rose-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-rose-400 group-hover:text-rose-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-rose-950">
                            {t('settings_registry.collections.title')}
                            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 ring-1 ring-rose-500/20 shadow-sm">
                                <Wallet className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.collections.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
                        <Scale className="h-4 w-4" />
                        Compliance Audit
                    </Button>
                    <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Issue Payment Plan
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="recovery" className="space-y-8">
                <TabsList className="bg-rose-50/50 p-1.5 rounded-3xl border border-rose-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="recovery" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.collections.recovery_logic')}
                    </TabsTrigger>
                    <TabsTrigger value="waiver" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.collections.waiver_policy')}
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.collections.legal_trigger')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="recovery" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl overflow-hidden border-t-4 border-t-rose-500">
                                <div className="p-6 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2">
                                        <Handshake className="h-4 w-4" />
                                        Resolution & Recovery Hub
                                    </h2>
                                    <Badge className="bg-rose-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic">Ethics Certified</Badge>
                                </div>
                                <div className="divide-y divide-rose-50 text-left">
                                    {cases.map((c) => (
                                        <div key={c.id} className="p-8 flex items-center justify-between hover:bg-rose-50/50 transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.status === 'Active' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        c.status === 'Legal' ? "bg-slate-900 text-white border-slate-700 animate-pulse" :
                                                            c.status === 'Hardship' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    REC
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.account}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.status === 'Active' ? "bg-rose-500 text-white" :
                                                                c.status === 'Legal' ? "bg-slate-900 text-white" :
                                                                    c.status === 'Hardship' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                        )}>
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-rose-600/70 font-black">{c.patient}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-100" />
                                                        <span>Due: {c.daysPastDue} Days</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Recovery Value</div>
                                                    <div className="text-[14px] text-rose-950 font-black uppercase tracking-tighter italic">{c.balance}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-rose-100 group-hover/item:text-rose-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 text-left">
                            <div className="bg-rose-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <BarChart3 className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-rose-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300">Resolution Index</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <CollMetric label="Recovery Rate" value="64.2%" detail="Vs Goal 70%" />
                                        <CollMetric label="Hardship Ratio" value="12.4%" detail="Total Balance" />
                                        <CollMetric label="Legal Conversion" value="2.1%" detail="Threshold Logic" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                                            <Landmark className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Active Placement Value</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">$1.2M <span className="text-xs font-medium text-white/40 uppercase">Agency Cycle</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="waiver" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-rose-500">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
                            <HeartHandshake className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight text-center">Hardship & Waiver Protocol</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed font-semibold">
                                Configure compassionate resolution logic for patient balances. Define poverty-level thresholds, installment plan durations, and automated waiver approval gates based on demographic and financial risk profiles.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-rose-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Thresholds</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-rose-600">Installment Logic</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <CollCard icon={Gavel} title="Legal Placement" status="Active Cycle" detail="Attorney Sync" color="rose" />
                        <CollCard icon={ShieldAlert} title="Patient Protections" status="Verified" detail="FDCPA Compliance" color="blue" />
                        <CollCard icon={FileWarning} title="Credit Reporting" status="90d Trigger" detail="Standard Reporting" color="blue" />
                        <CollCard icon={UserCheck} title="Resolution Rate" status="14% Legal" detail="Performance" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CollMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default text-left">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-rose-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '60%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function CollCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        rose: "bg-rose-500/10 text-rose-600 border-rose-100",
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
