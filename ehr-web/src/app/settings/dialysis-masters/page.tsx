'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Activity, Droplets,
    Settings2, LayoutGrid, Zap, ClipboardList, Database,
    ChevronRight, Gauge, Filter, Info,
    Timer, Share2, ShieldCheck, Thermometer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface DialysisStation {
    id: string;
    name: string;
    machineModel: string;
    status: 'Operational' | 'Maintenance' | 'Quarantined';
    lastService: string;
    clearanceEfficiency: string;
}

export default function DialysisMastersPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [stations] = useState<DialysisStation[]>([
        { id: '1', name: 'Station A-01', machineModel: 'Fresenius 5008S', status: 'Operational', lastService: '2024-03-12', clearanceEfficiency: '98.2%' },
        { id: '2', name: 'Station A-02', machineModel: 'Fresenius 5008S', status: 'Operational', lastService: '2024-03-15', clearanceEfficiency: '97.4%' },
        { id: '3', name: 'Station B-01 (ISO)', machineModel: 'Gambro Artis', status: 'Maintenance', lastService: '2024-04-01', clearanceEfficiency: 'N/A' },
        { id: '4', name: 'Station B-02', machineModel: 'Fresenius 5008S', status: 'Operational', lastService: '2024-02-28', clearanceEfficiency: '99.1%' },
        { id: '5', name: 'Station C-01 (Home)', machineModel: 'Baxter AK98', status: 'Quarantined', lastService: '2024-03-20', clearanceEfficiency: '85.0%' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-blue-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-blue-50 rounded-2xl transition-all border border-blue-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-blue-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.dialysis.title')}
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 ring-1 ring-blue-500/20">
                                <Droplets className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.dialysis.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                        <Share2 className="h-4 w-4" />
                        {t('settings_registry.dialysis.clearance_rules')}
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all hover:translate-y-[-2px] border-none">
                        <Plus className="h-4 w-4" />
                        Station Architecture
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Station Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search by station ID, machine model, or service status..."
                                className="pl-11 h-12 bg-white border-blue-100 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-blue-100 p-0 bg-white text-blue-400">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl overflow-hidden border-t-4 border-t-blue-500">
                        <div className="p-6 bg-blue-50/20 border-b border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-blue-600">
                                <LayoutGrid className="h-5 w-5" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">{t('settings_registry.dialysis.machine_config')}</h2>
                            </div>
                            <Badge className="bg-blue-600/10 text-blue-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                Units Online: 18/24
                            </Badge>
                        </div>

                        <div className="divide-y divide-blue-50">
                            {stations.map((st) => (
                                <div key={st.id} className="p-6 flex items-center justify-between hover:bg-blue-50/50 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                            st.status === 'Operational' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                st.status === 'Maintenance' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-red-50 text-red-500 border-red-100"
                                        )}>
                                            <Settings2 className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{st.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest",
                                                    st.status === 'Operational' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground/40"
                                                )}>
                                                    {st.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                                                <span className="text-blue-600/70 font-black">{st.machineModel}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>Efficiency: {st.clearanceEfficiency}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>Service: {st.lastService}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Kt/V Target</div>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                                                </div>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">&gt;1.2</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-blue-600/20 transition-colors bg-blue-50/50">
                                            <ChevronRight className="h-5 w-5 text-blue-300 group-hover/item:text-blue-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Unit Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/intel border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:scale-125 transition-transform duration-1000">
                            <Droplets className="h-32 w-32 " />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Gauge className="h-5 w-5 text-blue-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">{t('settings_registry.dialysis.fluid_logic')}</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-blue-500/30 pl-4">
                                "Ultra-filtration math is set to dry-weight variance mode. Safety stops triggered at 5% dry-weight loss."
                            </p>

                            <div className="space-y-6">
                                <DialysisMetric label="UF Rate Limit" value="13ml/kg/hr" detail="Safety Ceiling" />
                                <DialysisMetric label="Kt/V Mean" value="1.42" detail="Current Shift" />
                                <DialysisMetric label="Water Purity" value="Pass" detail="Reverse Osmosis" />
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                RO System Status
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3 text-blue-600">
                            <ShieldCheck className="h-5 w-5" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Safety Orchestration</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-100/50 transition-colors">
                                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><Timer className="h-4 w-4" /></div>
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">Turnaround Guard</h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal font-medium">Prevent station reuse before 30-min chemical disinfection cycle.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-100 transition-colors">
                                <div className="p-2 bg-white rounded-xl text-slate-600 shadow-sm"><Thermometer className="h-4 w-4" /></div>
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-foreground uppercase tracking-tight">Thermal Monitor</h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal font-medium">Automatic station shutdown if dialysate temp exceeds 39°C.</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-muted text-foreground hover:bg-accent border border-border shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            Unit Ledger
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DialysisMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-blue-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '82%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}
