'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, ShieldAlert, ShieldCheck,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, Activity, Lock, Eye,
    ClipboardList, BarChart3, LayoutGrid, Fingerprint,
    Radio, ShieldEllipsis, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SecurityEvent {
    id: string;
    agent: string;
    origin: string;
    status: 'Blocked' | 'Monitoring' | 'Active' | 'Neutralized';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    timestamp: string;
}

export default function CyberDefensePage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [events] = useState<SecurityEvent[]>([
        { id: '1', agent: 'Brute Force Attempt', origin: '142.12.x.x', status: 'Blocked', severity: 'High', timestamp: '14m ago' },
        { id: '2', agent: 'SQL Injection Probe', origin: '84.42.x.x', status: 'Neutralized', severity: 'Critical', timestamp: '2h ago' },
        { id: '3', agent: 'Unusual Egress Load', origin: 'Node-ICU-4', status: 'Monitoring', severity: 'Medium', timestamp: '42m ago' },
        { id: '4', agent: 'Expired Cert Link', origin: 'Mail-Gateway', status: 'Blocked', severity: 'Low', timestamp: '1d ago' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-100 pb-8 text-left">
                <div className="flex items-center gap-5 text-left">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-emerald-50 rounded-2xl transition-all border border-emerald-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-emerald-950 text-left">
                            {t('settings_registry.cyber_defense.title')}
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80 text-left">{t('settings_registry.cyber_defense.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                        <Eye className="h-4 w-4" />
                        Live SIEM
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Trigger Audit
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="threat" className="space-y-8">
                <TabsList className="bg-emerald-50/50 p-1.5 rounded-3xl border border-emerald-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="threat" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cyber_defense.threat_intel')}
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cyber_defense.security_policies')}
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.cyber_defense.compliance_score')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="threat" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden border-t-4 border-t-emerald-500">
                                <div className="p-6 bg-emerald-50/30 border-b border-emerald-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Advanced Threat registries
                                    </h2>
                                    <Badge className="bg-emerald-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic">IPS Active</Badge>
                                </div>
                                <div className="divide-y divide-emerald-50 text-left">
                                    {events.map((e) => (
                                        <div key={e.id} className="p-8 flex items-center justify-between hover:bg-emerald-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8 text-left">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    e.severity === 'Critical' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                                        e.severity === 'High' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                )}>
                                                    SOC
                                                </div>
                                                <div className="space-y-1.5 text-left text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{e.agent}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            e.status === 'Blocked' ? "bg-emerald-500 text-white" :
                                                                e.status === 'Active' ? "bg-orange-500 text-white" : "bg-slate-400 text-white"
                                                        )}>
                                                            {e.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-emerald-600/70 font-black">Origin: {e.origin}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-100" />
                                                        <span>Severity: {e.severity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Detected</div>
                                                    <div className="text-[14px] text-emerald-950 font-black uppercase tracking-tighter italic">{e.timestamp}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-emerald-100 group-hover/item:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 text-left">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <ShieldEllipsis className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Defensive Posture</h3>
                                    </div>
                                    <div className="space-y-6 text-left text-left">
                                        <SecMetric label="Attack Mitigation" value="100%" detail="Last 24h" />
                                        <SecMetric label="Zero-Day Readiness" value="Level 4" detail="ISO Index" />
                                        <SecMetric label="Encryption Depth" value="AES-256" detail="TLS 1.3 Active" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md text-left">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <Radio className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Global Sec-Alert Level</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest text-left">NORMAL <span className="text-xs font-medium text-white/40 uppercase">A-74 Guard</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="policies" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-emerald-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <Lock className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2 text-center text-left">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight text-center">Hierarchical Security Policy Engine</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed font-semibold text-center">
                                Define enterprise-wide authentication and access control logic. Configure multi-factor requirements, session timeout entropy, and context-aware RBAC rules for clinical and administrative staff nodes across all hospital branches.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-emerald-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Audit Policies</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-emerald-600">Lock Registry</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <SecCard icon={Fingerprint} title="HIPAA Auditor" status="98.2%" detail="Clinical Compliance" color="emerald" />
                        <SecCard icon={ShieldCheck} title="ISO 27001" status="Certified" detail="Infra Guard" color="blue" />
                        <SecCard icon={ClipboardList} title="GDPR Gateway" status="Active" detail="Patient Privacy" color="blue" />
                        <SecCard icon={ShieldAlert} title="Vulnerability Hub" status="Risk: Low" detail="Patch Registry" color="rose" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SecMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default text-left">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-emerald-400 transition-colors text-left">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '96%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function SecCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        rose: "bg-rose-500/10 text-rose-600 border-rose-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
