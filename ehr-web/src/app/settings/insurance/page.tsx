'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Landmark, Plus, Search, Filter, Info,
    ShieldCheck, Calendar, FileText, TrendingUp,
    AlertCircle, ChevronRight, CheckCircle2,
    Building2, Network, ScrollText, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface PayerContract {
    id: string;
    payerName: string;
    planType: string;
    networkStatus: 'In-Network' | 'Out-of-Network';
    expirationDate: string;
    preAuthRequired: boolean;
}

export default function InsuranceTPAPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [contracts] = useState<PayerContract[]>([
        { id: '1', payerName: 'Blue Cross Blue Shield', planType: 'PPO Commercial', networkStatus: 'In-Network', expirationDate: '31 Dec 2025', preAuthRequired: true },
        { id: '2', payerName: 'UnitedHealthcare', planType: 'Choice Plus', networkStatus: 'In-Network', expirationDate: '15 Oct 2025', preAuthRequired: false },
        { id: '3', payerName: 'Aetna Health', planType: 'Managed Care', networkStatus: 'In-Network', expirationDate: '01 Mar 2025', preAuthRequired: true },
        { id: '4', payerName: 'Cigna', planType: 'Global Health', networkStatus: 'Out-of-Network', expirationDate: 'Annual Renewal', preAuthRequired: true },
    ]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="p-2 hover:bg-accent rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                            {t('settings_registry.insurance_registry.title')}
                            <Landmark className="h-5 w-5 text-primary" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.insurance_registry.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border hover:bg-accent font-mono shadow-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {t('settings_registry.insurance_registry.claim_scrubbing')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase shadow-lg shadow-primary/25 border-none">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.insurance_registry.add_payer')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Stat Dashboard Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <QuickStat
                            icon={<Network className="h-4 w-4 text-blue-500" />}
                            label={t('settings_registry.insurance_registry.payer_networks')}
                            value="14 Active"
                            subtext="85% Facility Coverage"
                        />
                        <QuickStat
                            icon={<ScrollText className="h-4 w-4 text-purple-500" />}
                            label={t('settings_registry.insurance_registry.contract_terms')}
                            value="28 Models"
                            subtext="9 Updated this month"
                        />
                        <QuickStat
                            icon={<Timer className="h-4 w-4 text-amber-500" />}
                            label={t('settings_registry.insurance_registry.expiration_tracking')}
                            value="3 Expiring"
                            subtext="Next: Aetna (Mar 01)"
                            warning={true}
                        />
                    </div>

                    {/* Network Registry Table */}
                    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden transition-all duration-300">
                        <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground font-mono">
                                    Network Compliance Registry
                                </h2>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search by payer or plan..."
                                    className="pl-8 h-8 text-xs w-[280px] bg-background/50 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-[0.15em] border-b border-border">
                                        <th className="px-6 py-3 text-left">Payer Entity</th>
                                        <th className="px-6 py-3 text-left">Contract Status</th>
                                        <th className="px-6 py-3 text-left">Pre-Auth Logic</th>
                                        <th className="px-6 py-3 text-right">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {contracts.map(contract => (
                                        <tr key={contract.id} className="hover:bg-primary/5 transition-all group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{contract.payerName}</div>
                                                <div className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wide">{contract.planType}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn(
                                                    "text-[9px] h-4 py-0 font-bold uppercase",
                                                    contract.networkStatus === 'In-Network'
                                                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-none"
                                                        : "bg-muted text-muted-foreground border-border"
                                                )}>
                                                    {contract.networkStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {contract.preAuthRequired ? (
                                                    <div className="flex items-center gap-1.5 text-amber-600 font-bold uppercase text-[9px]">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Auth Required
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase text-[9px]">
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                        Auto-Approve
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-mono font-bold text-foreground">{contract.expirationDate}</div>
                                                <div className="text-[9px] text-muted-foreground mt-0.5">Auto-Renewal: {contract.id === '4' ? 'On' : 'Off'}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pre-Authorization Rules Grid */}
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group shadow-lg shadow-primary/5">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
                            <FileText className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-5">
                            <div className="flex items-start gap-5">
                                <div className="p-3.5 bg-background border border-border rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-[0.1em] mb-1">
                                            {t('settings_registry.insurance_registry.pre_auth_rules')}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-medium">
                                            {t('settings_registry.insurance_registry.pre_auth_desc')}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <RuleCard title="High-Cost Imaging" count="12 Procedures" />
                                        <RuleCard title="Outpatient Surg" count="45 Procedures" />
                                    </div>
                                    <Button className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-9 px-8 shadow-lg shadow-primary/20 border-none transition-all active:scale-95">
                                        {t('settings_registry.insurance_registry.validation_logic')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6 text-foreground">
                    <div className="bg-card rounded-2xl border border-border shadow-lg p-6 space-y-6">
                        <div>
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                Compliance Engine
                            </h2>
                            <div className="space-y-4">
                                <SidebarStat label="Avg Pre-auth Time" value="1.4 Days" trend="-0.2d" />
                                <SidebarStat label="Denial Rate" value="4.2%" trend="+0.1%" warning />
                                <SidebarStat label="Active Networks" value="14" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                                <Network className="h-3.5 w-3.5 text-primary" />
                                Network Intelligence
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                                Payer eligibility verification (270/271) is currently running every 15 minutes for arrivals.
                            </p>
                            <Button variant="outline" className="w-full text-[10px] font-bold uppercase h-9 border-border bg-background hover:bg-accent text-foreground transition-all">
                                {t('settings_registry.insurance_registry.network_status')}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-all duration-1000">
                            <Calendar className="h-24 w-24" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <Info className="h-4 w-4" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('settings_registry.insurance_registry.claim_scrubbing')}</h3>
                            </div>
                            <p className="text-[10px] text-emerald-50 leading-relaxed font-bold">
                                Automated scrubbing reduced denials by 18.5% last quarter. Your ruleset is due for a regular legal review.
                            </p>
                            <Button className="w-full h-9 bg-white text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold uppercase border-none shadow-xl transition-all active:scale-95">
                                Upgrade Logic Pack
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickStat({ icon, label, value, subtext, warning }: { icon: React.ReactNode, label: string, value: string, subtext: string, warning?: boolean }) {
    return (
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all">
            <div className="mb-4">{icon}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">{label}</div>
            <div className={cn("text-xl font-bold font-mono tracking-tight", warning ? "text-amber-500" : "text-foreground")}>{value}</div>
            <div className="text-[9px] text-muted-foreground font-medium mt-1">{subtext}</div>
        </div>
    );
}

function SidebarStat({ label, value, trend, warning }: { label: string, value: string, trend?: string, warning?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold font-mono", warning ? "text-amber-500" : "text-foreground")}>{value}</span>
                {trend && <span className={cn("text-[9px] font-bold", trend.startsWith('-') ? "text-green-500" : "text-amber-500")}>{trend}</span>}
            </div>
        </div>
    );
}

function RuleCard({ title, count }: { title: string, count: string }) {
    return (
        <div className="bg-background/80 backdrop-blur-sm border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/30 transition-colors shadow-sm cursor-pointer group/card">
            <div>
                <div className="text-[11px] font-bold text-foreground uppercase tracking-tight group-hover/card:text-primary transition-colors">{title}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5 font-medium">{count} mapped</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/card:translate-x-1 transition-all" />
        </div>
    );
}
