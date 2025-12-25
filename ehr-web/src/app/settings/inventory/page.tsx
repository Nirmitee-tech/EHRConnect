'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Boxes, Warehouse,
    Navigation, ListChecks, Zap, BarChart3, ChevronRight,
    Gauge, Filter, Info, History, Activity,
    PackageSearch, Truck, FileText, LayoutGrid,
    Tags, Layers, ClipboardList, PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryItem {
    id: string;
    sku: string;
    description: string;
    category: string;
    stock: string;
    status: 'In-Stock' | 'Low-Stock' | 'Empty';
    location: string;
}

export default function InventoryPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [items] = useState<InventoryItem[]>([
        { id: '1', sku: 'MS-202-A', description: 'Sterile Surgical Gloves (Size 7)', category: 'Surgical Consumables', stock: '2,400 Pairs', status: 'In-Stock', location: 'BIN-04-A-12' },
        { id: '2', sku: 'IV-540-C', description: 'Normal Saline 500mL Bag', category: 'IV Fluids', stock: '120 Units', status: 'Low-Stock', location: 'RACK-02-B' },
        { id: '3', sku: 'PPE-102-K', description: 'N95 Respirator Masks', category: 'PPE / Safety', stock: '4,200 Units', status: 'In-Stock', location: 'BIN-10-C-01' },
        { id: '4', sku: 'LAB-902-S', description: 'Vacutainer EDTA (Purple)', category: 'Laboratory Supplies', stock: '12 Tubes', status: 'Empty', location: 'DR-04-B' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-5 text-left">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-slate-900">
                            {t('settings_registry.inventory.title')}
                            <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/10">
                                <Warehouse className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.inventory.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <PackageSearch className="h-4 w-4" />
                        Master SKU Audit
                    </Button>
                    <Button className="gap-2 bg-slate-900 hover:bg-black text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Log Stock Intake
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="stock" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-3xl border border-slate-200 h-14 w-fit shadow-inner">
                    <TabsTrigger value="stock" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.inventory.bin_location')}
                    </TabsTrigger>
                    <TabsTrigger value="replenish" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.inventory.reorder_logic')}
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.inventory.stock_audit')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        placeholder="Search by SKU, description, or location..."
                                        className="pl-11 h-12 bg-white border-slate-200 focus:ring-4 focus:ring-slate-900/5 rounded-2xl transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 p-0 bg-white text-slate-400">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden border-t-4 border-t-slate-900">
                                <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        Warehouse Storage Registry
                                    </h2>
                                    <Badge className="bg-slate-900 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center">GS1 / UDI Standard</Badge>
                                </div>
                                <div className="divide-y divide-slate-100 text-left">
                                    {items.map((item) => (
                                        <div key={item.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    item.status === 'In-Stock' ? "bg-slate-50 text-slate-900 border-slate-100" :
                                                        item.status === 'Low-Stock' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            "bg-red-50 text-red-600 border-red-100 animate-pulse"
                                                )}>
                                                    {item.sku.split('-')[0]}
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{item.description}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            item.status === 'In-Stock' ? "bg-slate-900 text-white" :
                                                                item.status === 'Low-Stock' ? "bg-amber-500 text-white" : "bg-red-600 text-white"
                                                        )}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-slate-900/70 font-black">{item.sku}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        <span>Loc: {item.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Live Count</div>
                                                    <div className="text-sm text-slate-900 font-black uppercase tracking-tight italic">{item.stock}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-100 group-hover/item:text-slate-900 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl text-left">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <BarChart3 className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Logistics Depth</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <InvenMetric label="Days on Hand" value="18d" detail="Avg Turn Rate" />
                                        <InvenMetric label="Stockout Risk" value="1.2%" detail="Projected 48h" />
                                        <InvenMetric label="Storage Yield" value="94%" detail="Vol Efficiency" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <PackageCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Active Store Value</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">$842K <span className="text-xs font-medium text-white/40 uppercase">Consumables</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="replenish" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-slate-900">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900 shadow-inner">
                            <Zap className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Auto-Replenishment Orchestration</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Define Economic Order Quantity (EOQ) and Safety Stock levels for critical items. Automated PO triggers ensure optimal stock levels based on real-time clinical consumption and lead-time shifts.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-slate-900 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure EOQ Points</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-slate-900">Safety Thresholds</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InvenCard icon={ClipboardList} title="Cycle Counting" status="Weekly Cycle" detail="Continuous Audit" color="slate" />
                        <InvenCard icon={Tags} title="RFID Mesh Status" status="Operational" detail="98% Coverage" color="blue" />
                        <InvenCard icon={Navigation} title="Mobile Pick Path" status="Optimized" detail="Zone Picking" color="blue" />
                        <InvenCard icon={History} title="Adjustment Logs" status="Level 2" detail="Drift Tracking" color="amber" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InvenMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-slate-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500" style={{ width: '75%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function InvenCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        slate: "bg-slate-900/10 text-slate-900 border-slate-100",
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
                    <span className="text-sm font-black text-slate-900">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
