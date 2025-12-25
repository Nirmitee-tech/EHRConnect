'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Droplets, Thermometer,
    ShieldAlert, ClipboardList, Zap, Database,
    ChevronRight, Gauge, Filter, Info,
    Wind, Activity, Package, UserCheck, Timer, Siren
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BloodProduct {
    id: string;
    product: string;
    inventory: string;
    tempStatus: 'Stable' | 'Drift' | 'Critical';
    lastLog: string;
    storageNode: string;
}

export default function BloodBankPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [products] = useState<BloodProduct[]>([
        { id: '1', product: 'O-Negative Packed cells', inventory: '12 Units', tempStatus: 'Stable', lastLog: '2m ago', storageNode: 'FRZ-01-A' },
        { id: '2', product: 'Fresh Frozen Plasma (FFP)', inventory: '48 Units', tempStatus: 'Stable', lastLog: '5m ago', storageNode: 'FRZ-04-C' },
        { id: '3', product: 'Platelets (Single Donor)', inventory: '4 Units', tempStatus: 'Drift', lastLog: '1m ago', storageNode: 'AGIT-02' },
        { id: '4', product: 'Cryoprecipitate pool', inventory: '20 Units', tempStatus: 'Stable', lastLog: '12m ago', storageNode: 'FRZ-01-B' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-rose-50 rounded-2xl transition-all border border-rose-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-rose-400 group-hover:text-rose-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.blood_bank.title')}
                            <div className="p-2 bg-red-500/10 rounded-xl text-red-600 ring-1 ring-red-500/20 shadow-sm">
                                <Droplets className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.blood_bank.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
                        <Siren className="h-4 w-4" />
                        MTP Emergency Mode
                    </Button>
                    <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-red-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Log Inventory Unit
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="safety" className="space-y-8">
                <TabsList className="bg-rose-50/50 p-1.5 rounded-3xl border border-rose-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="safety" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.blood_bank.cross_match')}
                    </TabsTrigger>
                    <TabsTrigger value="coldchain" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.blood_bank.cold_chain')}
                    </TabsTrigger>
                    <TabsTrigger value="reactions" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.blood_bank.adverse_reaction')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="safety" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl overflow-hidden border-t-4 border-t-red-500">
                                <div className="p-6 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Dispensing Safety Registry</h2>
                                    <Badge className="bg-red-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3">ISBT-128 Compliant</Badge>
                                </div>
                                <div className="divide-y divide-rose-50">
                                    {products.map((p) => (
                                        <div key={p.id} className="p-8 flex items-center justify-between hover:bg-rose-50/50 transition-all group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                                    p.tempStatus === 'Stable' ? "bg-rose-50 text-red-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                                                )}>
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{p.product}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            p.inventory === '0 Units' ? "bg-slate-200 text-slate-500" : "bg-red-500 text-white"
                                                        )}>
                                                            {p.inventory}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                                                        <span>{p.storageNode}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                                                        <span>{p.lastLog}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Safety Seal</div>
                                                    <div className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                                        <UserCheck className="h-3 w-3" /> VERIFIED
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-rose-200 group-hover/item:text-red-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-110 transition-transform duration-1000">
                                    <Thermometer className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-400" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300">Cold Chain Monitor</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <BloodMetric label="Freezer-01" value="-22.4°C" detail="Optimal" color="red" />
                                        <BloodMetric label="Agitator-02" value="22.1°C" detail="Platelet Hub" color="amber" />
                                        <BloodMetric label="TAT Cross-match" value="24m" detail="Avg Response" color="red" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-2 text-rose-400">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Wastage Rate</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">0.42% <span className="text-xs font-medium text-white/40 uppercase font-bold tracking-tight">of units</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="coldchain" className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-red-500">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-red-600 shadow-inner">
                            <Thermometer className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Chain of Custody Orchestration</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Define sensor thresholds for blood product storage. Any drift beyond 2°C triggers an immediate automated quarantine and notification to the Blood Bank Director.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-red-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Thresholds</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-600">Sensor Mapping</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="reactions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ReactionCard icon={Siren} title="Hemolytic Reaction" status="Active Protocol" urgency="Level 1 Stop" color="red" />
                        <ReactionCard icon={Wind} title="TRALI Protocol" status="Active Protocol" urgency="Critical" color="rose" />
                        <ReactionCard icon={Droplets} title="TACO Risk Gate" status="Active Protocol" urgency="High" color="amber" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BloodMetric({ label, value, detail, color }: { label: string, value: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        red: "text-red-400",
        amber: "text-amber-400"
    };

    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-red-400 transition-colors">
                <span>{label}</span>
                <span className={cn("text-[13px] font-black font-mono text-white", colors[color] && `group-hover/metric:${colors[color]}`)}>{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '100%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function ReactionCard({ icon: Icon, title, status, urgency, color }: { icon: any, title: string, status: string, urgency: string, color: string }) {
    const colors: Record<string, string> = {
        red: "bg-red-500/10 text-red-600 border-red-100",
        rose: "bg-rose-500/10 text-rose-600 border-rose-100",
        amber: "bg-amber-500/10 text-amber-600 border-amber-100"
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
                <Badge className={cn("text-[8px] h-4 mt-2 px-2 font-black uppercase tracking-widest border-none", colors[color])}>{urgency}</Badge>
            </div>
        </div>
    );
}
