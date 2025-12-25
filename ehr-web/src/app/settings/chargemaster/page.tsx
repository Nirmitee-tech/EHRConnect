'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Banknote, CreditCard,
    Share2, Database, Zap, ClipboardList, ShieldCheck,
    ChevronRight, Gauge, Filter, Info,
    TrendingUp, FileText, Landmark, Wallet, Calculator, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeeItem {
    id: string;
    code: string;
    description: string;
    category: string;
    basePrice: string;
    status: 'Active' | 'Under Review' | 'Deprecated';
}

export default function ChargemasterPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [fees] = useState<FeeItem[]>([
        { id: '1', code: 'PRO-1025', description: 'Consultation - Senior Consultant', category: 'OPD Services', basePrice: '$150.00', status: 'Active' },
        { id: '2', code: 'LAB-5402', description: 'Complete Blood Count (CBC)', category: 'Laboratory', basePrice: '$45.00', status: 'Active' },
        { id: '3', code: 'RAD-9021', description: 'CT Scan - Head (Non-Contrast)', category: 'Radiology', basePrice: '$850.00', status: 'Under Review' },
        { id: '4', code: 'SUR-4402', description: 'Appendectomy (Laparoscopic)', category: 'Surgical', basePrice: '$4,200.00', status: 'Active' },
        { id: '5', code: 'DRG-1102', description: 'Amoxicillin 500mg (Unit Dose)', category: 'Pharmacy', basePrice: '$2.15', status: 'Active' },
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
                            {t('settings_registry.chargemaster.title')}
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 ring-1 ring-emerald-500/20">
                                <Banknote className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.chargemaster.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                        <TrendingUp className="h-4 w-4" />
                        Revenue Analytics
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Add Billable Item
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="fees" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-3xl border border-border h-14 w-fit shadow-inner">
                    <TabsTrigger value="fees" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.chargemaster.fee_schedule')}
                    </TabsTrigger>
                    <TabsTrigger value="tariffs" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.chargemaster.payer_tariffs')}
                    </TabsTrigger>
                    <TabsTrigger value="mapping" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.chargemaster.revenue_mapping')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fees" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <Input
                                        placeholder="Search by code, description, or category..."
                                        className="pl-11 h-12 bg-white border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="h-12 w-12 rounded-2xl border-emerald-100 p-0 bg-white text-emerald-400">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden border-t-4 border-t-emerald-500">
                                <div className="p-6 bg-emerald-50/20 border-b border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <Wallet className="h-5 w-5" />
                                        <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Global Price catalog</h2>
                                    </div>
                                    <Badge className="bg-emerald-500 text-white border-none text-[8px] h-5 font-bold uppercase tracking-widest px-3 leading-none flex items-center">v2024.R2 Stable</Badge>
                                </div>

                                <div className="divide-y divide-emerald-50">
                                    {fees.map((fee) => (
                                        <div key={fee.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/50 transition-all cursor-pointer group/item">
                                            <div className="flex items-center gap-8">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner">
                                                    <Calculator className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{fee.description}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            fee.status === 'Active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                        )}>
                                                            {fee.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                        <span className="text-emerald-600/70 font-black">{fee.code}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                                                        <span>{fee.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-foreground tracking-tighter">{fee.basePrice}</div>
                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Base Rate</div>
                                                </div>
                                                <div className="p-2 rounded-xl group-hover/item:bg-emerald-500/10 transition-colors">
                                                    <ChevronRight className="h-5 w-5 text-emerald-100 group-hover/item:text-emerald-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-110 transition-transform duration-1000">
                                    <TrendingUp className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-emerald-400" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Market Intelligence</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <FeeMetric label="Price Deviation" value="-2.4%" detail="Vs Regional Peer" />
                                        <FeeMetric label="Yield Optimization" value="94%" detail="Revenue Leak" />
                                        <FeeMetric label="CPT Compliance" value="100%" detail="Audit Secure" />
                                    </div>
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                        Revenue Simulations
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                                <div className="flex items-center gap-3 text-emerald-600 font-black italic">
                                    <ShieldCheck className="h-5 w-5" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Contractual Guardrails</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Insurance Caps</span>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px]">Active</Badge>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Self-Pay Discount</span>
                                        <span className="text-[10px] font-bold text-emerald-600">15% Auto</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tariffs" className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-emerald-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <Landmark className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Payer-Specific override Hub</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Manage complex TPA and Insurance contracts. Define percentage-based or flat-rate overrides for specific payers, ensuring accurate billing at the point of service.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-emerald-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Payer Tariffs</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-emerald-600">Contract Registry</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="mapping" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MappingCard icon={Database} title="GL Oracle Sync" status="Operational" detail="General Ledger" color="emerald" />
                        <MappingCard icon={FileText} title="Cost Center Mappings" status="142 Rules" detail="Allocations" color="blue" />
                        <MappingCard icon={CreditCard} title="Point of Sale Integration" status="Active" detail="Merchant Sync" color="blue" />
                        <MappingCard icon={ArrowUpRight} title="Tax Jurisdiction" status="Level 4" detail="Sales Tax" color="orange" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function FeeMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-emerald-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '80%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function MappingCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        orange: "bg-orange-500/10 text-orange-600 border-orange-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all">
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
