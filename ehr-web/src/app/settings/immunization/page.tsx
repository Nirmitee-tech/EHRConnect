'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Syringe, ShieldCheck,
    Calendar, ClipboardList, Filter, ChevronRight,
    Database, Info, AlertTriangle, Activity,
    History, Award, Globe, Truck, FileBadge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface Vaccine {
    id: string;
    name: string;
    type: 'Inactivated' | 'mRNA' | 'Live-Attenuated' | 'Toxoid';
    brand: string;
    schedule: string;
    stock: number;
    lotStatus: 'Normal' | 'Expiring Soon' | 'Recall Warning';
}

export default function ImmunizationCatalogPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [vaccines] = useState<Vaccine[]>([
        { id: '1', name: 'MMR II', type: 'Live-Attenuated', brand: 'Merck & Co.', schedule: '2-Dose (12mo, 4-6yr)', stock: 480, lotStatus: 'Normal' },
        { id: '2', name: 'Comirnaty (COVID-19)', type: 'mRNA', brand: 'Pfizer-BioNTech', schedule: 'Multi-Dose / Booster', stock: 1250, lotStatus: 'Expiring Soon' },
        { id: '3', name: 'Fluarix Quadrivalent', type: 'Inactivated', brand: 'GSK', schedule: 'Annual (Seasonal)', stock: 2400, lotStatus: 'Normal' },
        { id: '4', name: 'Engerix-B', type: 'Inactivated', brand: 'GSK', schedule: '3-Dose (0, 1, 6mo)', stock: 320, lotStatus: 'Normal' },
        { id: '5', name: 'Gardasil 9', type: 'Inactivated', brand: 'Merck & Co.', schedule: '2/3-Dose Series', stock: 180, lotStatus: 'Recall Warning' },
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
                            {t('settings_registry.immunization.title')}
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                                <Syringe className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.immunization.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-accent shadow-sm">
                        <Globe className="h-4 w-4" />
                        {t('settings_registry.immunization.vaccine_schedule')}
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.immunization.brand_registry')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Vaccine List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                                placeholder="Filter vaccines by brand, type, or schedule..."
                                className="pl-11 h-12 bg-card border-border focus:ring-4 focus:ring-emerald-600/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border p-0 bg-card">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden border-t-4 border-t-emerald-500/50">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileBadge className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.immunization.brand_registry')}</h2>
                            </div>
                            <Badge className="bg-emerald-600/10 text-emerald-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                WHO SAGE Framework v3.2
                            </Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {vaccines.map((vac) => (
                                <div key={vac.id} className="p-6 flex items-center justify-between hover:bg-emerald-600/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border border-transparent group-hover/item:border-emerald-200",
                                            vac.lotStatus === 'Recall Warning' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            <Syringe className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{vac.name}</h3>
                                                <Badge className={cn(
                                                    "text-[7px] font-black uppercase border-none tracking-[0.1em] px-1.5 h-4",
                                                    vac.lotStatus === 'Recall Warning' ? "bg-red-500 text-white" :
                                                        vac.lotStatus === 'Expiring Soon' ? "bg-amber-500 text-white" :
                                                            "bg-emerald-500/10 text-emerald-600"
                                                )}>
                                                    {vac.lotStatus}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span className="text-emerald-600/70">{vac.brand}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span>{vac.type}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span>{vac.schedule}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[12px] font-black text-foreground tracking-tight">{vac.stock.toLocaleString()} Units</div>
                                            <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Current Inventory</div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-emerald-600/10 transition-colors bg-accent/30">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-emerald-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Public Health & Safety */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/safety border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/safety:scale-125 transition-transform duration-700">
                            <ShieldCheck className="h-24 w-24" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Award className="h-5 w-5 text-amber-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Safety & Reporting</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-amber-500/30 pl-4">
                                "VAERS automated reporting is currently ACTIVE. 12 adverse incident reports were successfully transmitted to CDC/FDA this quarter."
                            </p>

                            <div className="space-y-4">
                                <SafetyMetric label="Adverse Rate" value="0.02%" status="Low" />
                                <SafetyMetric label="Compliance" value="98.5%" status="High" />
                                <SafetyMetric label="Recall Sync" value="Live" status="Secure" />
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                VAERS Integrator
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-2xl space-y-8 relative group/lot overflow-hidden">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="h-5 w-5 text-primary text-emerald-600" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.immunization.lot_management')}</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover/lot:bg-emerald-100/50 transition-colors">
                                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><History className="h-4 w-4" /></div>
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">Cold Chain Audit</h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal font-medium">Auto-logs refrigerator temperature every 15 mins for all lot storage locations.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100 group-hover/lot:bg-red-100/50 transition-colors">
                                <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm"><Truck className="h-4 w-4" /></div>
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">Expiry Intercept</h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal font-medium">Prevent dispensing for lots within 48 hours of expiration date.</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-2xl bg-muted text-foreground hover:bg-accent border border-border shadow-none text-[10px] font-black uppercase tracking-widest gap-2">
                            <Database className="h-4 w-4" />
                            Inventory Ledger
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SafetyMetric({ label, value, status }: { label: string, value: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/metric shadow-sm">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover/metric:text-white/60 transition-colors">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-white">{value}</span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase bg-emerald-400/20 px-2 py-0.5 rounded leading-none">{status}</span>
            </div>
        </div>
    );
}
