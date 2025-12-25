'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, GraduationCap, Medal,
    Zap, Database, ChevronRight, Gauge, Filter,
    Info, History, Activity, BookOpen, Scroll,
    ClipboardList, BarChart3, LayoutGrid, Award,
    FileCheck, BookMarked, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourseRecord {
    id: string;
    title: string;
    category: 'Clinical' | 'Compliance' | 'Technical';
    status: 'Active' | 'Draft' | 'Archived';
    enrolled: number;
    completion: string;
}

export default function TrainingPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [courses] = useState<CourseRecord[]>([
        { id: '1', title: 'Advanced Cardiac Life Support (ACLS)', category: 'Clinical', status: 'Active', enrolled: 142, completion: '92%' },
        { id: '2', title: 'HIPAA & Cyber Hygiene 2024', category: 'Compliance', status: 'Active', enrolled: 842, completion: '100%' },
        { id: '3', title: 'EHR Automation Optimization', category: 'Technical', status: 'Draft', enrolled: 0, completion: '0%' },
        { id: '4', title: 'Infection Control Protocols', category: 'Clinical', status: 'Active', enrolled: 210, completion: '88%' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-100 pb-8 text-left">
                <div className="flex items-center gap-5 text-left">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-indigo-50 rounded-2xl transition-all border border-indigo-100 group shadow-sm text-center"
                    >
                        <ArrowLeft className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4 text-indigo-950 text-left">
                            {t('settings_registry.training.title')}
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 ring-1 ring-indigo-500/20 shadow-sm">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80 text-left">{t('settings_registry.training.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                        <Award className="h-4 w-4" />
                        Credential Hub
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all hover:translate-y-[-2px]">
                        <Plus className="h-4 w-4" />
                        Create Module
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="catalog" className="space-y-8">
                <TabsList className="bg-indigo-50/50 p-1.5 rounded-3xl border border-indigo-100 h-14 w-fit shadow-inner">
                    <TabsTrigger value="catalog" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.training.course_catalog')}
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.training.certification_matrix')}
                    </TabsTrigger>
                    <TabsTrigger value="credits" className="rounded-2xl px-8 h-11 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all">
                        {t('settings_registry.training.training_credits')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="catalog" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6 text-left">
                            <div className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-2xl overflow-hidden border-t-4 border-t-indigo-500">
                                <div className="p-6 bg-indigo-50/30 border-b border-indigo-100 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                                        <BookMarked className="h-4 w-4" />
                                        Hospital Learning modules
                                    </h2>
                                    <Badge className="bg-indigo-500 text-white border-none text-[8px] h-5 font-black uppercase tracking-widest px-3 leading-none flex items-center italic">CME Compliant</Badge>
                                </div>
                                <div className="divide-y divide-indigo-50 text-left">
                                    {courses.map((c) => (
                                        <div key={c.id} className="p-8 flex items-center justify-between hover:bg-indigo-50/50 transition-all cursor-pointer group/item text-left">
                                            <div className="flex items-center gap-8">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border text-[10px] font-black italic",
                                                    c.category === 'Clinical' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                        c.category === 'Compliance' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    LXP
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-foreground tracking-tight">{c.title}</h4>
                                                        <Badge className={cn(
                                                            "text-[8px] h-4 px-2 font-black border-none uppercase tracking-widest",
                                                            c.status === 'Active' ? "bg-indigo-500 text-white" : "bg-slate-400 text-white"
                                                        )}>
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                                        <span className="text-indigo-600/70 font-black">{c.category}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-100" />
                                                        <span>Enrolled: {c.enrolled}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 text-right">
                                                <div className="hidden md:block">
                                                    <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Completion Rate</div>
                                                    <div className="text-[12px] text-indigo-950 font-black uppercase tracking-tighter italic">{c.completion}</div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-indigo-100 group-hover/item:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 text-left">
                            <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/stats border border-white/5 shadow-3xl text-left">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:scale-125 transition-transform duration-1000">
                                    <Medal className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-8 text-left">
                                    <div className="flex items-center gap-3 text-indigo-400">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300">Competency Index</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <EduMetric label="Credentail Maturity" value="88.4%" detail="Vs Org Goal" />
                                        <EduMetric label="Mandatory Completion" value="100%" detail="Cycle: 2024" />
                                        <EduMetric label="LXP Engagement" value="4h/mo" detail="Clinician Avg" />
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mt-4 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                            <UserCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Renewal Gatekeeper</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-widest">14 <span className="text-xs font-medium text-white/40 uppercase">Pending Review</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="matrix" className="space-y-6 text-left">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-t-4 border-t-indigo-500">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                            <Scroll className="h-10 w-10 font-black" />
                        </div>
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight text-center">Certification & Credential Matrix</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed font-semibold text-center">
                                Define and monitor hospital-wide certification requirements. Configure automated alerting for license expires and automated clinical privilege suspending based on credential maturity.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-indigo-600 h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Audit Matrix</Button>
                            <Button variant="outline" className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border text-indigo-600">License Gate</Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="credits" className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        <EduCard icon={BookOpen} title="CME Tracking Hub" status="Operational" detail="Clinical Credits" color="indigo" />
                        <EduCard icon={FileCheck} title="Privilege Logging" status="Verified" detail="MSR Sync" color="blue" />
                        <EduCard icon={GraduationCap} title="Sabbatical Logic" status="Active" detail="Policy Engine" color="blue" />
                        <EduCard icon={Medal} title="Hall of Experts" status="Level 4" detail="Internal Badges" color="emerald" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EduMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default text-left">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-indigo-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black font-mono">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '82%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}

function EduCard({ icon: Icon, title, status, detail, color }: { icon: any, title: string, status: string, detail: string, color: string }) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-100",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-lg space-y-4 group hover:translate-y-[-4px] transition-all text-left">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-indigo-600">{status}</span>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-2">{detail}</p>
            </div>
        </div>
    );
}
