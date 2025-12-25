'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, MonitorSpeaker, Thermometer,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, Activity, Wrench, ShieldCheck,
    ClipboardList, FlaskConical, LayoutGrid, Timer,
    AlertTriangle, Microscope, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalDevice {
    id: string;
    model: string;
    serialNum: string;
    unit: string;
    status: 'Operational' | 'Maintenance' | 'Down' | 'Calibration Due';
    lastService: string;
}

export default function BiomedPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [devices] = useState<MedicalDevice[]>([
        { id: '1', model: 'GE Carescape B650 Monitor', serialNum: 'SN-90210-GE', unit: 'ICU-B', status: 'Operational', lastService: '12d ago' },
        { id: '2', model: 'Puritan Bennett 980 Vent', serialNum: 'VN-4402-PB', unit: 'ER-Subnet', status: 'Calibration Due', lastService: '344d ago' },
        { id: '3', model: 'Philips Epiq CVx Echo', serialNum: 'EC-1102-PH', unit: 'Cardiology', status: 'Maintenance', lastService: 'Now' },
        { id: '4', model: 'Baxter Sigma Spectrum Pump', serialNum: 'IP-8422-BX', unit: 'General Ward', status: 'Operational', lastService: '5d ago' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-blue-100 pb-8 text-left">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-blue-50 rounded-2xl transition-all border border-blue-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-blue-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-blue-950">
                            {t('settings_registry.biomed.title')}
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 ring-1 ring-blue-500/20 shadow-sm">
                                <MonitorSpeaker className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.biomed.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-blue-100 text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                        <Wrench className="h-4 w-4" />
                        Service Tickets
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Register New Asset
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="assets" className="space-y-8">
                <TabsList className="bg-blue-50/50 p-1.5 rounded-3xl border border-blue-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="assets" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.biomed.asset_register')}
                    </TabsTrigger>
                    <TabsTrigger value="pm" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.biomed.pm_schedule')}
                    </TabsTrigger>
                    <TabsTrigger value="calibration" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.biomed.calibration')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assets" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl overflow-hidden border-t-4 border-t-blue-500">
                                <div className="p-6 bg-blue-50/30 border-b border-blue-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                        <Cpu className="h-4 w-4" />
                                        Medical Device Registry
                                    </h2>
                                    <Badge className="bg-blue-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic">HECC Compliant</Badge>
                                </div>
                                <div className="divide-y divide-blue-50">
                                    {devices.map((d) => (
                                        <div key={d.id} className="p-8 flex items-center justify-between hover:bg-blue-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    d.status === 'Operational' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        d.status === 'Down' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                            "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    DEV
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{d.model}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            d.status === 'Operational' ? "bg-emerald-500 text-white" :
                                                                d.status === 'Calibration Due' ? "bg-amber-500 text-white" : "bg-red-600 text-white"
                                                        )}>
                                                            {d.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-blue-600/70 font-black">{d.serialNum}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />
                                                        <span>Unit: {d.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Last Scan</div>
                                                    <div className="text-[8px] text-blue-600 font-bold uppercase tracking-widest italic">{d.lastService}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-blue-100 group-hover/item:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 text-left">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <Activity className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <Timer className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Engineering Index</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <BioMetric label="Uptime Mean" value="98.2%" detail="Global Fleet" />
                                        <BioMetric label="PM Compliance" value="100%" detail="Safety Audit" />
                                        <BioMetric label="MTBF" value="412d" detail="Failure Gap" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Regulatory Health</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">PASS <span className="text-xs font-medium text-white/40 uppercase">AAMI / Joint Comm</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pm" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-blue-500">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                            <Zap className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Preventative Maintenance Hub</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configure automated inspection cycles for critical life-support systems and diagnostic medical devices. Define multi-level inspection protocols based on clinical usage patterns and OEM specifications.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-blue-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configure PM Cycles</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-blue-600">Inspection Templates</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="calibration" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <BioCard icon={Thermometer} title="Temperature Vault" status="Operational" detail="Sensors Hub" color="blue" />
                        <BioCard icon={FlaskConical} title="Analyzer Quality" status="Verified" detail="LIS Drivers" color="blue" />
                        <BioCard icon={AlertTriangle} title="Tolerance Drift" status="2 Devices" detail="Calibration Due" color="amber" />
                        <BioCard icon={Microscope} title="Optics Precision" status="Level 4" detail="Visual Systems" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BioMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-blue-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '92%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function BioCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        amber: "bg-amber-500/10 text-amber-600 border-amber-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-blue-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
