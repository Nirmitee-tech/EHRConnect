'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Banknote, CreditCard,
    Calculator, Landmark, Wallet, ShieldCheck, ClipboardList,
    Zap, Database, ChevronRight, Gauge, Filter, Info,
    History, Activity, FileText, Scale, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalaryComponent {
    id: string;
    name: string;
    type: 'Earning' | 'Deduction' | 'Benefit';
    calculation: 'Fixed' | 'Percentage' | 'Formula';
    status: 'Active' | 'Under Review';
}

export default function PayrollPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [components] = useState<SalaryComponent[]>([
        { id: '1', name: 'Basic Salary', type: 'Earning', calculation: 'Fixed', status: 'Active' },
        { id: '2', name: 'Shift Differential (Night)', type: 'Earning', calculation: 'Percentage', status: 'Active' },
        { id: '3', name: 'Federal Income Tax', type: 'Deduction', calculation: 'Formula', status: 'Active' },
        { id: '4', name: 'Healthcare Insurance Premium', type: 'Deduction', calculation: 'Fixed', status: 'Under Review' },
        { id: '5', name: 'On-Call Allowance', type: 'Benefit', calculation: 'Formula', status: 'Active' },
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
                            {t('settings_registry.payroll.title')}
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 ring-1 ring-blue-500/20 shadow-sm">
                                <Banknote className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.payroll.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                        <History className="h-4 w-4" />
                        Disbursement Logs
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Initial Pay Cycle
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="components" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-3xl border border-border h-14 w-fit shadow-inner">
                    <TabsTrigger value="components" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.payroll.salary_components')}
                    </TabsTrigger>
                    <TabsTrigger value="tax" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.payroll.tax_jurisdictions')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="components" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex bg-card p-4 items-center justify-between rounded-3xl border border-border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Master Earnings & Deductions</h3>
                                </div>
                                <Badge className="bg-blue-500/10 text-blue-600 border-none text-[8px] h-5 font-black uppercase tracking-widest">Global Pay Master v4.0</Badge>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-blue-500 text-left">
                                <div className="divide-y divide-border/50">
                                    {components.map((c) => (
                                        <div key={c.id} className="p-6 flex items-center justify-between hover:bg-blue-500/[0.02] transition-all group/item">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.type === 'Earning' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        c.type === 'Deduction' ? "bg-red-50 text-red-600 border-red-100" :
                                                            "bg-blue-50 text-blue-600 border-blue-100"
                                                )}>
                                                    {c.type.charAt(0)}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.name}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.status === 'Active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                        )}>
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-blue-600/70 font-black">{c.type}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        <span>Logic: {c.calculation}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Audit Trace</div>
                                                    <div className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest italic">Compliance Secure</div>
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
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-110 transition-transform duration-1000">
                                    <TrendingUp className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-blue-300">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Pay Cycle Analytics</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <PayrollMetric label="Net Disbursement" value="$4.2M" detail="This Month" />
                                        <PayrollMetric label="Tax Liability" value="$1.1M" detail="Pending Sync" />
                                        <PayrollMetric label="Benefits Yield" value="94.2%" detail="Engagement" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Regulatory Status</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">CLEAR <span className="text-xs font-medium text-white/40 uppercase">No Drifts Found</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tax" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-blue-500">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                            <Scale className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Tax Jurisdiction Orchestration</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Manage regional and federal tax math logic. Define income brackets, standard deductions, and regional variations according to the facility\'s geographic employee distribution.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-blue-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure Tax Math</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-blue-600">Region Mapping</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PayrollMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-blue-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}
