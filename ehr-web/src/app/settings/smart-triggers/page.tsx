'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Zap, Plus, Workflow, Settings2,
    Bell, Mail, ShieldAlert, ChevronRight, Play,
    Clock, Cpu, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface RuleNode {
    id: string;
    event: string;
    condition: string;
    action: string;
    status: 'Active' | 'Draft' | 'Disabled';
}

export default function SmartTriggersPage() {
    const { t } = useTranslation('common');
    const [rules] = useState<RuleNode[]>([
        { id: '1', event: 'Lab Result Received', condition: 'Potassium > 5.5 mmol/L', action: 'Urgent System Alert + SMS to On-call', status: 'Active' },
        { id: '2', event: 'Patient Admission', condition: 'Age > 65 + Fall Risk = High', action: 'Add Fall Protocol to Order Set', status: 'Active' },
        { id: '3', event: 'Medication Ordered', condition: 'Category: Antibiotics', action: 'Log to Antimicrobial Registry', status: 'Draft' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-10 animate-in fade-in duration-700">
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
                            {t('settings_registry.smart_triggers.title')}
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.smart_triggers.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="gap-3 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-12 px-8 tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
                        <Plus className="h-4 w-4" />
                        New Automation Rule
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Active Rules */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden group/card hover:border-primary/20 transition-all duration-500">
                        <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Cpu className="h-5 w-5 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.smart_triggers.active_rules')}</h2>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest">3 Rules Running</Badge>
                        </div>

                        <div className="divide-y divide-border/50">
                            {rules.map(rule => (
                                <div key={rule.id} className="p-8 flex items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className="w-14 h-14 rounded-[1.25rem] bg-muted flex items-center justify-center text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-700 group-hover/item:shadow-xl group-hover/item:shadow-primary/20">
                                            <Play className="h-6 w-6 ml-1" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-foreground tracking-tight group-hover/item:text-primary transition-colors">{rule.event}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] py-0 font-bold uppercase h-4 px-2 tracking-widest border-none",
                                                    rule.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                                                )}>{rule.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                                    <Settings2 className="h-3.5 w-3.5" />
                                                    {rule.condition}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                                    <Workflow className="h-3.5 w-3.5" />
                                                    {rule.action}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl group-hover/item:bg-primary/10 transition-colors">
                                        <ChevronRight className="h-6 w-6 text-muted-foreground/20 group-hover/item:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickActionCard icon={<Bell />} label="In-App Alert" desc="Push notifications for clinicians" color="blue" />
                        <QuickActionCard icon={<Mail />} label="Email Sync" desc="Automated report mailing" color="indigo" />
                        <QuickActionCard icon={<ShieldAlert />} label="Hard Stop" desc="Safety protocol enforcement" color="red" />
                    </div>
                </div>

                {/* Right: Infrastructure & Insights */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group/infra border border-white/5">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover/infra:bg-primary/30 transition-all duration-1000" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Execution Engine</h3>
                            </div>

                            <div className="space-y-6">
                                <InfraStat label="Rule Latency" value="12ms" desc="Average trigger delay" />
                                <InfraStat label="Weekly Events" value="1.2k" desc="Automated actions taken" />
                                <InfraStat label="Safety Checks" value="100%" desc="Condition validation rate" />
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                                <Clock className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Real-time Pipeline Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group/pro">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/pro:scale-150 transition-transform duration-1000 rotate-45">
                            <Zap className="h-32 w-32 text-primary" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Automation Pro-Tip</h4>
                        <p className="text-[11px] text-primary/70 leading-relaxed font-medium italic relative z-10">
                            "Combine multiple events with AND/OR logic to create complex clinical decision support workflows that reduce clinician fatigue."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ icon, label, desc, color }: { icon: React.ReactNode, label: string, desc: string, color: 'blue' | 'indigo' | 'red' }) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/10",
        indigo: "text-indigo-500 bg-indigo-500/10",
        red: "text-red-500 bg-red-500/10"
    };

    return (
        <div className="p-6 bg-card rounded-3xl border border-border shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner", colors[color])}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-6 w-6" })}
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1 tracking-tight">{label}</h4>
            <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
        </div>
    );
}

function InfraStat({ label, value, desc }: { label: string, value: string, desc: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-xl font-bold font-mono text-white tracking-widest">{value}</span>
            </div>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">{desc}</p>
        </div>
    );
}
