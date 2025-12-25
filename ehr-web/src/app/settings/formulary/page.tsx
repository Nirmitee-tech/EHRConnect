'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Pill, ShieldAlert,
    Activity, ClipboardList, Zap, Database,
    ChevronRight, MoreVertical, Filter, AlertTriangle,
    FlaskConical, Info, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface Medication {
    id: string;
    name: string;
    genericName: string;
    therapeuticClass: string;
    dosageForm: string;
    status: 'Active' | 'Under Review' | 'Discontinued';
    riskCategory: 'Low' | 'Moderate' | 'High' | 'REMS';
}

export default function FormularyPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [medications] = useState<Medication[]>([
        { id: '1', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', therapeuticClass: 'Antibiotics', dosageForm: 'Capsule', status: 'Active', riskCategory: 'Low' },
        { id: '2', name: 'Metformin 850mg', genericName: 'Metformin Hydrochloride', therapeuticClass: 'Antidiabetics', dosageForm: 'Tablet', status: 'Active', riskCategory: 'Low' },
        { id: '3', name: 'Warfarin 5mg', genericName: 'Warfarin Sodium', therapeuticClass: 'Anticoagulants', dosageForm: 'Tablet', status: 'Active', riskCategory: 'High' },
        { id: '4', name: 'Lisinopril 10mg', genericName: 'Lisinopril', therapeuticClass: 'ACE Inhibitors', dosageForm: 'Tablet', status: 'Active', riskCategory: 'Moderate' },
        { id: '5', name: 'Oxycodone 10mg', genericName: 'Oxycodone Hydrochloride', therapeuticClass: 'Opioids', dosageForm: 'Controlled Release Tablet', status: 'Active', riskCategory: 'REMS' },
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
                            {t('settings_registry.formulary.title')}
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Pill className="h-6 w-6 text-primary" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.formulary.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent">
                        <Database className="h-4 w-4" />
                        {t('settings_registry.formulary.interaction_check')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.formulary.new_drug')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Filters & List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder={t('settings_registry.formulary.search_placeholder') || "Search medication catalog..."}
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.formulary.drug_registry')}</h2>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">
                                4,821 Molecules Active
                            </Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {medications.map((med) => (
                                <div key={med.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:rotate-12 group-hover/item:scale-110",
                                            med.riskCategory === 'High' || med.riskCategory === 'REMS' ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{med.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-bold uppercase border-none tracking-widest",
                                                    med.riskCategory === 'REMS' ? "bg-purple-500 text-white" :
                                                        med.riskCategory === 'High' ? "bg-red-500/10 text-red-500" :
                                                            "bg-green-500/10 text-green-500"
                                                )}>
                                                    {med.riskCategory}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span>{med.genericName}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span>{med.therapeuticClass}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-primary/70">{med.dosageForm}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">{med.status}</div>
                                            <div className="text-[9px] text-muted-foreground font-medium italic">Last audit: 2d ago</div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-primary/10 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Insights & Global Standards */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden group/card border border-white/5">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover/card:scale-150 transition-transform duration-1000 rotate-12">
                            <FlaskConical className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-primary" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Safety Intelligence</h3>
                            </div>

                            <div className="space-y-6">
                                <SafetyInsight
                                    icon={<AlertTriangle className="text-amber-400" />}
                                    title="Contraindication Logic"
                                    desc="System is currently syncing with FDA Global Drug Database v2.4"
                                    status="Live"
                                />
                                <SafetyInsight
                                    icon={<Activity className="text-red-400" />}
                                    title="LASA Warnings"
                                    desc="Look-Alike Sound-Alike alerts enabled for 120 high-risk molecules."
                                    status="Active"
                                />
                                <SafetyInsight
                                    icon={<ShieldAlert className="text-blue-400" />}
                                    title="REMS Compliance"
                                    desc="Strict electronic signature required for Category-X substance orders."
                                    status="Enforced"
                                />
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-[10px] font-bold uppercase tracking-widest shadow-xl">
                                    Open Safety Registry
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group/pro">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Formulary Health</h4>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex gap-1 justify-between">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
                                <div key={i} className="w-2 h-8 bg-primary/20 rounded-full overflow-hidden">
                                    <div className="w-full bg-primary rounded-full transition-all duration-1000" style={{ height: `${Math.random() * 60 + 40}%` }} />
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-primary/70 leading-relaxed font-semibold italic">"98.4% of prescribed medications are within the preferred hospital formulary, reducing procurement overhead."</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SafetyInsight({ icon, title, desc, status }: { icon: React.ReactNode, title: string, desc: string, status: string }) {
    return (
        <div className="flex gap-4 group/item">
            <div className="p-3 bg-white/5 rounded-2xl h-fit border border-white/10 group-hover/item:bg-white/10 transition-colors">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</h4>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-tighter bg-primary/20 px-1.5 rounded">{status}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}
