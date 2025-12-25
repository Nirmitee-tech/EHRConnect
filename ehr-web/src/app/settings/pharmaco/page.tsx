'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Dna, ShieldAlert,
    Activity, ClipboardList, Zap, Database,
    ChevronRight, Microscope, Filter, Info,
    Gavel, BookOpen, AlertCircle, Sparkles, Binary, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface GeneticRule {
    id: string;
    gene: string;
    marker: string;
    drugAffected: string;
    sensitivity: 'Normal' | 'Intermediate' | 'Poor' | 'Ultra-Rapid';
    evidenceLevel: 'Level 1-A' | 'Level 1-B' | 'Level 2' | 'Emerging';
}

export default function PharmacogenomicsPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [rules] = useState<GeneticRule[]>([
        { id: '1', gene: 'CYP2C19', marker: '*2, *3', drugAffected: 'Clopidogrel', sensitivity: 'Poor', evidenceLevel: 'Level 1-A' },
        { id: '2', gene: 'CYP2D6', marker: '*4, *5', drugAffected: 'Codeine', sensitivity: 'Ultra-Rapid', evidenceLevel: 'Level 1-A' },
        { id: '3', gene: 'SLCO1B1', marker: 'c.521T>C', drugAffected: 'Simvastatin', sensitivity: 'Intermediate', evidenceLevel: 'Level 1-B' },
        { id: '4', gene: 'HLA-B', marker: '*57:01', drugAffected: 'Abacavir', sensitivity: 'Normal', evidenceLevel: 'Level 1-A' },
        { id: '5', gene: 'DPYD', marker: '*2A, *13', drugAffected: '5-Fluorouracil', sensitivity: 'Poor', evidenceLevel: 'Level 1-B' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 font-sans">
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
                            {t('settings_registry.pharmaco.title')}
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600">
                                <Dna className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.pharmaco.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent">
                        <BookOpen className="h-4 w-4" />
                        {t('settings_registry.pharmaco.clinical_guidelines')}
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        New Genetic Logic
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Sensitivity Rules */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-purple-600 transition-colors" />
                            <Input
                                placeholder="Search by gene (CYP2D6), marker (*2), or drug (Warfarin)..."
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-purple-600/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0 bg-card">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-purple-500/50">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Binary className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.pharmaco.sensitivity_rules')}</h2>
                            </div>
                            <Badge className="bg-purple-600/10 text-purple-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                CPIC-Compliant Node
                            </Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {rules.map((rule) => (
                                <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-purple-600/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-700 group-hover/item:scale-110 shadow-inner border",
                                            rule.sensitivity === 'Poor' || rule.sensitivity === 'Ultra-Rapid' ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">{rule.gene}</span>
                                            <span className="text-[8px] font-bold opacity-70 leading-none">{rule.marker}</span>
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{rule.drugAffected}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest leading-none",
                                                    rule.evidenceLevel.includes('Level 1') ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground/40"
                                                )}>
                                                    {rule.evidenceLevel}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg border",
                                                    rule.sensitivity === 'Poor' ? "bg-red-50 text-red-600 border-red-100" :
                                                        rule.sensitivity === 'Ultra-Rapid' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                )}>
                                                    {rule.sensitivity} Metabolizer
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>Allele Mapping: {rule.marker}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Phenotype Warning</div>
                                            <div className="text-[9px] text-muted-foreground font-medium italic">Triggered for {rule.marker} variant</div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-purple-600/10 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-purple-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Scientific Evidence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/guidelines border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/guidelines:scale-150 transition-transform duration-[2000ms]">
                            <Microscope className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-300">CPIC Integration</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed font-serif text-white/50">
                                Clinical Pharmacogenetics Implementation Consortium (CPIC®) guidelines are currently synchronized.
                            </p>

                            <div className="space-y-4">
                                <EvidenceMetric label="Sync Status" value="Online" status="Success" />
                                <EvidenceMetric label="Guideline Version" value="v2024.1" status="Latest" />
                                <EvidenceMetric label="Global Rules" value="842" status="Active" />
                            </div>

                            <Button className="w-full bg-purple-600 hover:bg-purple-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                Run Delta Analysis
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group/warning overflow-hidden">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Decision Support</h4>
                        </div>

                        <div className="space-y-5">
                            <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl group-hover/warning:border-red-500/30 transition-all">
                                <h5 className="text-[11px] font-black text-red-600 uppercase tracking-tight mb-1">Hard Stop Triggers</h5>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium italic">
                                    Orders for Abacavir will be blocked if HLA-B*57:01 status is unknown or positive.
                                </p>
                            </div>
                            <div className="p-5 bg-purple-600/5 border border-purple-600/10 rounded-2xl group-hover/warning:border-purple-600/30 transition-all">
                                <h5 className="text-[11px] font-black text-purple-600 uppercase tracking-tight mb-1">Dose Modification</h5>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium italic">
                                    Warfarin dosing logic automatically incorporates CYP2C9 and VKORC1 variants if available in the genomic lake.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-border">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Rule Health: 100%</span>
                            </div>
                            <MoreVertical className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EvidenceMetric({ label, value, status }: { label: string, value: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/metric">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-white">{value}</span>
                <span className="text-[8px] font-bold text-purple-400 uppercase bg-purple-400/20 px-2 py-0.5 rounded leading-none">{status}</span>
            </div>
        </div>
    );
}
