'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Scissors, ShieldCheck,
    ClipboardCheck, Activity, Zap, Layers,
    ChevronRight, Settings2, Filter, Info,
    Eye, Stethoscope, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface Procedure {
    id: string;
    code: string;
    name: string;
    specialty: string;
    category: 'Surgical' | 'Diagnostic' | 'Non-Invasive';
    sterileReq: boolean;
    anesthesiaType: string;
    baseRate: number;
}

export default function ProceduresPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [procedures] = useState<Procedure[]>([
        { id: '1', code: '47562', name: 'Laparoscopic Cholecystectomy', specialty: 'General Surgery', category: 'Surgical', sterileReq: true, anesthesiaType: 'General', baseRate: 1500 },
        { id: '2', code: '93452', name: 'Left Heart Catheterization', specialty: 'Cardiology', category: 'Surgical', sterileReq: true, anesthesiaType: 'MAC/Sedation', baseRate: 2200 },
        { id: '3', code: '71045', name: 'Chest X-Ray (Single View)', specialty: 'Radiology', category: 'Diagnostic', sterileReq: false, anesthesiaType: 'None', baseRate: 120 },
        { id: '4', code: '29881', name: 'Knee Arthroscopy w/ Meniscectomy', specialty: 'Orthopedics', category: 'Surgical', sterileReq: true, anesthesiaType: 'General/Spinal', baseRate: 1800 },
        { id: '5', code: '99213', name: 'Office Outpatient Visit (Level 3)', specialty: 'Internal Medicine', category: 'Non-Invasive', sterileReq: false, anesthesiaType: 'None', baseRate: 85 },
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
                            {t('settings_registry.procedures.title')}
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Scissors className="h-6 w-6 text-primary" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.procedures.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent">
                        <Layers className="h-4 w-4" />
                        {t('settings_registry.procedures.service_master')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.procedures.new_procedure')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Search & Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder={t('settings_registry.procedures.search_placeholder') || "Filter codes or names..."}
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
                                <Settings2 className="h-5 w-5 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.procedures.procedure_codes')}</h2>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">CPT-4</Badge>
                                <Badge className="bg-purple-500/10 text-purple-500 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">HCPCS Level II</Badge>
                            </div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {procedures.map((proc) => (
                                <div key={proc.id} className="p-6 flex items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110",
                                            proc.sterileReq ? "bg-blue-500/10 text-blue-500 border border-blue-200/50" : "bg-muted text-muted-foreground"
                                        )}>
                                            {proc.category === 'Surgical' ? <Scissors className="h-5 w-5" /> :
                                                proc.category === 'Diagnostic' ? <Activity className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter">Code {proc.code}</span>
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{proc.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span>{proc.specialty}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className={cn(proc.sterileReq ? "text-blue-500" : "text-muted-foreground/40")}>
                                                    {proc.sterileReq ? 'Sterile Environment' : 'Clean Environment'}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span>Anesthesia: {proc.anesthesiaType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[12px] font-black text-foreground tracking-tight">${proc.baseRate.toLocaleString()}</div>
                                            <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Base Rate (HCP)</div>
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

                {/* Right: Operational Config */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl p-8 space-y-8 relative overflow-hidden group/card shadow-primary/5">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">RCM Intelligence</h3>
                        </div>

                        <div className="space-y-6">
                            <RCMStep
                                icon={<Briefcase />}
                                title="Tariff Synchronization"
                                desc="Procedures are automatically linked to department-level fee schedules."
                            />
                            <RCMStep
                                icon={<ShieldCheck />}
                                title="Pre-Auth Mapping"
                                desc="Detect codes requiring prior-authorization from insurance payers."
                            />
                            <RCMStep
                                icon={<ClipboardCheck />}
                                title="Compliance Audit"
                                desc="Validate medical necessity rules for Medicare/Medicaid billing."
                            />
                        </div>

                        <div className="p-6 bg-accent/50 rounded-3xl border border-border">
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                "Updating procedure base rates will affect all unsubmitted claims. Please ensure compliance audit before publishing changes."
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/bundles border border-white/5">
                        <div className="absolute -bottom-10 -right-10 opacity-5 rotate-45 scale-150 transition-transform duration-1000 group-hover/bundles:scale-[2] group-hover/bundles:rotate-90">
                            <Scissors className="h-40 w-40" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Plus className="h-4 w-4 text-blue-400" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Pre-op Bundles</h4>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Configure Sterile Clearance Rules</h2>
                            <p className="text-xs text-white/50 leading-relaxed font-medium">
                                Link specific laboratory tests (e.g., INR, Creatinine) as mandatory prerequisites before allowing a surgical booking.
                            </p>
                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-10 text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl mt-4">
                                Manage Clearance Rules
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RCMStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 group/item">
            <div className="p-3 bg-muted rounded-2xl h-fit border border-border group-hover/item:border-primary/30 transition-colors group-hover/item:bg-primary/5">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5 text-muted-foreground transition-colors group-hover/item:text-primary" })}
            </div>
            <div className="space-y-1">
                <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider">{title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}
