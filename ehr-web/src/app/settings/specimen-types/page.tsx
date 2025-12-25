'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Syringe, Thermometer,
    Clock, FlaskConical, Filter, ChevronRight,
    MoreVertical, Info, Database, AlertCircle,
    Truck, Microscope, CheckCircle2, Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface SpecimenType {
    id: string;
    name: string;
    category: 'Blood' | 'Urine' | 'Swab' | 'Tissue' | 'Fluid';
    primaryContainer: string;
    stabilityRoom: string;
    stabilityRefrig: string;
    stabilityFrozen: string;
}

export default function SpecimenRegistryPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [specimens] = useState<SpecimenType[]>([
        { id: '1', name: 'Whole Blood (CBC)', category: 'Blood', primaryContainer: 'Lavender Top (EDTA)', stabilityRoom: '24 hrs', stabilityRefrig: '48 hrs', stabilityFrozen: 'Not Recommended' },
        { id: '2', name: 'Serum (Chemistry)', category: 'Blood', primaryContainer: 'Red Top (SST)', stabilityRoom: '8 hrs', stabilityRefrig: '7 days', stabilityFrozen: '30 days' },
        { id: '3', name: 'Midstream Urine', category: 'Urine', primaryContainer: 'Sterile Cup', stabilityRoom: '2 hrs', stabilityRefrig: '24 hrs', stabilityFrozen: 'Not Recommended' },
        { id: '4', name: 'Nasopharyngeal Swab', category: 'Swab', primaryContainer: 'Viral Transport Media (VTM)', stabilityRoom: '24 hrs', stabilityRefrig: '72 hrs', stabilityFrozen: '30 days' },
        { id: '5', name: 'Biopsy Core', category: 'Tissue', primaryContainer: 'Formalin Jar', stabilityRoom: 'Indefinite', stabilityRefrig: 'N/A', stabilityFrozen: 'N/A' },
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
                            {t('settings_registry.specimen_types.title')}
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Syringe className="h-6 w-6 transform -rotate-45" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.specimen_types.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent shadow-sm">
                        <Microscope className="h-4 w-4" />
                        {t('settings_registry.specimen_types.container_registry')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Add Specimen Logic
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Specimen Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Filter specimen types or collection codes..."
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0 bg-card">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FlaskConical className="h-5 w-5 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.specimen_types.collection_rules')}</h2>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-1.5 grayscale opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Analyzer Ready</span>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">
                                    LIS Integrator Active
                                </Badge>
                            </div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {specimens.map((spec) => (
                                <div key={spec.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border border-transparent group-hover/item:border-primary/20",
                                            spec.category === 'Blood' ? "bg-red-50 text-red-500" :
                                                spec.category === 'Urine' ? "bg-amber-50 text-amber-500" :
                                                    "bg-blue-50 text-blue-500"
                                        )}>
                                            {spec.category === 'Blood' ? <Syringe className="h-5 w-5" /> :
                                                spec.category === 'Urine' ? <FlaskConical className="h-5 w-5" /> : <Microscope className="h-5 w-5" />}
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{spec.name}</h3>
                                                <Badge className="bg-muted text-muted-foreground/60 border-none text-[7px] font-black uppercase px-1.5 h-4 tracking-tighter italic">{spec.category}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                                                <span className="text-primary">{spec.primaryContainer}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span>Room Temp: {spec.stabilityRoom}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 md:ml-auto">
                                        <div className="grid grid-cols-2 gap-4 text-right">
                                            <div>
                                                <div className="text-[10px] font-black text-blue-500 tracking-tight uppercase">{spec.stabilityRefrig}</div>
                                                <div className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                                    <Thermometer className="h-2 w-2" /> Refrig
                                                </div>
                                            </div>
                                            <div>
                                                <div className={cn(
                                                    "text-[10px] font-black tracking-tight uppercase",
                                                    spec.stabilityFrozen === 'Not Recommended' ? "text-red-400" : "text-purple-500"
                                                )}>
                                                    {spec.stabilityFrozen}
                                                </div>
                                                <div className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                                    <Snowflake className="h-2 w-2" /> Frozen
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-primary/20 transition-colors bg-accent/50">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Lab Infrastructure */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden group/it border border-white/5">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/it:scale-125 transition-transform duration-700">
                            <Truck className="h-24 w-24" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-emerald-400 animate-spin-slow" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Turnaround Mastery</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-emerald-500/30 pl-4">
                                "92% of Stat specimens are processed within the 45-minute target window. Current bottleneck: Clinical Pathology."
                            </p>

                            <div className="space-y-4">
                                <InfrastructureMetric label="LIS Latency" value="14ms" trend="Optimal" />
                                <InfrastructureMetric label="Courier Sync" value="Live" trend="Active" />
                                <InfrastructureMetric label="Auto-Accession" value="99.2%" trend="Stable" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-2xl space-y-8 relative group/alert overflow-hidden">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Transport Protocol</h4>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 ring-1 ring-border p-4 rounded-3xl group-hover/alert:ring-primary/20 transition-all">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-500 text-xs font-black">STAT</div>
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">Rapid Response Routing</h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal italic font-medium">STAT samples trigger immediate notification to the floor and dedicated lab accessioning line.</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-2xl bg-muted text-foreground hover:bg-accent border border-border shadow-none text-[10px] font-black uppercase tracking-widest gap-2">
                            <Database className="h-4 w-4" />
                            Accession Logs
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfrastructureMetric({ label, value, trend }: { label: string, value: string, trend: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-white">{value}</span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-1.5 rounded">{trend}</span>
            </div>
        </div>
    );
}
