'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Baby, Heart,
    Activity, ClipboardList, ShieldCheck, ChevronRight,
    Filter, Info, Zap, Database, Calendar,
    Scale, Thermometer, UserCheck, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface MaternityLogic {
    id: string;
    stage: string;
    description: string;
    defaultVitalsFreq: string;
    alertThresholds: string;
    status: 'Active' | 'Under Review' | 'Draft';
}

export default function MaternityLogicPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [stages] = useState<MaternityLogic[]>([
        { id: '1', stage: 'Early Labor (Latent)', description: '0-6cm dilation, regular contractions', defaultVitalsFreq: 'Every 60 mins', alertThresholds: 'FHR < 110 bpm', status: 'Active' },
        { id: '2', stage: 'Active Labor', description: '6-10cm dilation, intense contractions', defaultVitalsFreq: 'Every 15 mins', alertThresholds: 'FHR Decels > 15s', status: 'Active' },
        { id: '3', stage: 'Transition / Pushing', description: '10cm dilation, active effort', defaultVitalsFreq: 'Continuous / 5 mins', alertThresholds: 'Bradycardia Stop-Gate', status: 'Active' },
        { id: '4', stage: 'Immediate Post-Partum', description: 'Placental delivery - 2 hours post', defaultVitalsFreq: 'Every 15 mins (Temp/Pulse)', alertThresholds: 'Hemorrhage Risk Alpha', status: 'Active' },
        { id: '5', stage: 'Neonatal Stabilization', description: 'Initial 6 hours of neonate life', defaultVitalsFreq: 'Standard Transition', alertThresholds: 'APGAR < 7 mapping', status: 'Under Review' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-rose-50 rounded-2xl transition-all border border-rose-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-rose-400 group-hover:text-rose-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            {t('settings_registry.maternity.title')}
                            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 ring-1 ring-rose-500/20">
                                <Baby className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.maternity.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all">
                        <Heart className="h-4 w-4" />
                        {t('settings_registry.maternity.fetal_monitoring')}
                    </Button>
                    <Button className="gap-2 bg-rose-500 hover:bg-rose-600 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 transition-all hover:translate-y-[-2px] border-none">
                        <Plus className="h-4 w-4" />
                        New Stage Logic
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Labor Logic Explorer */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300 group-focus-within:text-rose-500 transition-colors" />
                            <Input
                                placeholder="Search labor stages, delivery bundles, or PPH protocols..."
                                className="pl-11 h-12 bg-white border-rose-100 focus:ring-4 focus:ring-rose-500/10 rounded-2xl transition-all font-medium placeholder:text-rose-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-rose-100 p-0 bg-white text-rose-400">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl overflow-hidden border-t-4 border-t-rose-400">
                        <div className="p-6 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-rose-600">
                                <Stethoscope className="h-5 w-5" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600/80">{t('settings_registry.maternity.delivery_bundles')}</h2>
                            </div>
                            <Badge className="bg-rose-500/10 text-rose-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                NICE/ACOG Harmonized
                            </Badge>
                        </div>

                        <div className="divide-y divide-rose-50">
                            {stages.map((st) => (
                                <div key={st.id} className="p-6 flex items-center justify-between hover:bg-rose-50/50 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-sm border",
                                            st.status === 'Active' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{st.stage}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest leading-none",
                                                    st.status === 'Active' ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground/40"
                                                )}>
                                                    {st.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-rose-400/60 uppercase tracking-widest">
                                                <span className="text-rose-600/70 font-black">{st.defaultVitalsFreq} Monitor</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-100" />
                                                <span className="italic">{st.description}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-rose-600 tracking-wider uppercase">Risk Alert</div>
                                            <div className="text-[9px] text-rose-400 font-bold uppercase tracking-[0.05em]">{st.alertThresholds}</div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-rose-500/10 transition-colors bg-rose-50">
                                            <ChevronRight className="h-5 w-5 text-rose-300 group-hover/item:text-rose-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Security & Analytics */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/security border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/security:scale-110 transition-transform duration-1000">
                            <UserCheck className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-rose-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300">{t('settings_registry.maternity.neonatal_logic')}</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-rose-500/30 pl-4">
                                "RFID pairing logic is active. Infant-Mother match verification required for every transfer."
                            </p>

                            <div className="space-y-6">
                                <MaternityMetric label="Naegele's Standard" value="LMP + 9mo + 7d" detail="EDD Calculation" />
                                <MaternityMetric label="APGAR Scorer" value="Active" detail="v2.4 Logic" />
                                <MaternityMetric label="RFID Drift" value="Safe" detail="Security Sync" />
                            </div>

                            <Button className="w-full bg-rose-600 hover:bg-rose-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                Pair Audit Logs
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-rose-100 rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3 text-rose-500">
                            <Calendar className="h-5 w-5" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Gestational Intelligence</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100 group-hover:border-rose-400 transition-all">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-rose-700 uppercase">Growth Percentiles</span>
                                    <p className="text-[9px] text-muted-foreground">WHO child growth standards 2024</p>
                                </div>
                                <Scale className="h-4 w-4 text-rose-400" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100 group-hover:border-rose-400 transition-all">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-rose-700 uppercase">Toco Integration</span>
                                    <p className="text-[9px] text-muted-foreground">Waveform parsing for uterine activity</p>
                                </div>
                                <Zap className="h-4 w-4 text-amber-500" />
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            OB Master Rules
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MaternityMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-rose-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[11px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '100%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}
