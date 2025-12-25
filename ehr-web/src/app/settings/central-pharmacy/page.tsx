'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Pill, ShieldAlert,
    ClipboardList, Zap, Database, ChevronRight, Gauge,
    Filter, Info, History, Activity, Boxes,
    Truck, FileText, LayoutGrid, PackageCheck, Lock,
    CornerDownRight, BarChart3, FlaskConical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NarcoticEntry {
    id: string;
    drug: string;
    inventory: string;
    status: 'Secure' | 'Drift' | 'Audit Required';
    lastLog: string;
    witnessedBy: string;
}

export default function CentralPharmacyPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [narcotics] = useState<NarcoticEntry[]>([
        { id: '1', drug: 'Morphine Sulfate 10mg/mL', inventory: '42 Vials', status: 'Secure', lastLog: '24m ago', witnessedBy: 'Nurse.J' },
        { id: '2', drug: 'Fentanyl Citrate 50mcg/mL', inventory: '18 Amps', status: 'Drift', lastLog: '5m ago', witnessedBy: 'Pharm.K' },
        { id: '3', drug: 'Oxycodone 5mg Tabs', inventory: '500 Units', status: 'Secure', lastLog: '1h ago', witnessedBy: 'Nurse.M' },
        { id: '4', drug: 'Remifentanil 1mg Powder', inventory: '6 Vials', status: 'Secure', lastLog: '12m ago', witnessedBy: 'Pharm.D' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-emerald-50 rounded-2xl transition-all border border-emerald-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-emerald-950">
                            {t('settings_registry.central_pharmacy.title')}
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
                                <Pill className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.central_pharmacy.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                        <Lock className="h-4 w-4" />
                        Narcotics Master Lock
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Issue Medication Batch
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="narco" className="space-y-8">
                <TabsList className="bg-emerald-50/50 p-1.5 rounded-3xl border border-emerald-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="narco" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.central_pharmacy.narcotics_log')}
                    </TabsTrigger>
                    <TabsTrigger value="dispense" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.central_pharmacy.dispensing_logic')}
                    </TabsTrigger>
                    <TabsTrigger value="procure" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.central_pharmacy.procurement_sync')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="narco" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden border-t-4 border-t-emerald-500">
                                <div className="p-6 bg-emerald-50/30 border-b border-emerald-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4" />
                                        Controlled Substance Registry
                                    </h2>
                                    <Badge className="bg-emerald-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center">Dual-Sign Verified</Badge>
                                </div>
                                <div className="divide-y divide-emerald-50 text-left">
                                    {narcotics.map((n) => (
                                        <div key={n.id} className="p-8 flex items-center justify-between hover:bg-emerald-50/50 transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                                    n.status === 'Secure' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                                                )}>
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{n.drug}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            n.status === 'Secure' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                        )}>
                                                            {n.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-emerald-600/70 font-black">{n.inventory}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-100" />
                                                        <span>Witness: {n.witnessedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Vault Stamp</div>
                                                    <div className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest italic">{n.lastLog}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-emerald-100 group-hover/item:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <FlaskConical className="h-32 w-32 text-white" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Supply Metrics</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <PharmMetric label="Fill Latency" value="12m" detail="Stat Orders" />
                                        <PharmMetric label="Inventory Accuracy" value="99.98%" detail="RFID Verified" />
                                        <PharmMetric label="Hazard Ratio" value="0.2%" detail="Waste Index" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <PackageCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Global Stock Value</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">$2.4M <span className="text-xs font-medium text-white/40 uppercase">Live Index</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="dispense" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-emerald-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <Zap className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Intelligent Dispensing Engine</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configure multi-level dispensing logic for Unit-Dose, Bulk Ward, and Satellite Pharmacies. Define automated substitution rules and high-alert medication double-check gates.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-emerald-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Substitution</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-emerald-600">Satellite Nodes</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="procure" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <NodeCard icon={Truck} title="Vendor EDI Sync" status="Operational" detail="Primary Wholesaler" color="emerald" />
                        <NodeCard icon={BarChart3} title="Forecast Engine" status="Level 4" detail="Demand Logic" color="blue" />
                        <NodeCard icon={Boxes} title="Inventory Drift" status="Active" detail="Real-time Tracking" color="blue" />
                        <NodeCard icon={CornerDownRight} title="Lead Time Offset" status="14h Mean" detail="Logistics Math" color="amber" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PharmMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-emerald-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '90%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function NodeCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        amber: "bg-amber-500/10 text-amber-600 border-amber-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
