'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, FileCheck, Plus, Search, Filter, Info,
    FileText, Edit3, Trash2, GitBranch, History,
    Eye, ShieldCheck, Copy, ChevronRight, Layout,
    PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface ConsentTemplate {
    id: string;
    title: string;
    category: 'Surgical' | 'General' | 'Research';
    version: string;
    lastUpdated: string;
    status: 'published' | 'draft' | 'archived';
}

export default function ConsentMasterPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [templates] = useState<ConsentTemplate[]>([
        { id: '1', title: 'Inpatient General Consent', category: 'General', version: 'v2.4', lastUpdated: 'Dec 20, 2024', status: 'published' },
        { id: '2', title: 'Laparoscopic Appendectomy', category: 'Surgical', version: 'v1.1', lastUpdated: 'Nov 12, 2024', status: 'published' },
        { id: '3', title: 'Post-Op Blood Transfusion', category: 'General', version: 'v1.0', lastUpdated: 'Jan 05, 2025', status: 'published' },
        { id: '4', title: 'Cardiovascular Research Study', category: 'Research', version: 'v0.8', lastUpdated: 'Yesterday', status: 'draft' },
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
                            {t('settings_registry.consents.title')}
                            <FileCheck className="h-5 w-5 text-primary" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.consents.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border hover:bg-accent font-mono">
                        <History className="h-4 w-4" />
                        {t('settings_registry.consents.version_control')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.consents.new_template')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Templates Catalog */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">
                                    {t('settings_registry.consents.template_registry')}
                                </h2>
                            </div>
                            <div className="relative group/search">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                                <Input
                                    placeholder="Filter by title or type..."
                                    className="pl-8 h-8 text-xs w-[260px] bg-background border-border focus:ring-2 focus:ring-primary/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {templates.map((tpl) => (
                                <div key={tpl.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2.5 rounded-lg border",
                                            tpl.category === 'Surgical' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                tpl.category === 'General' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                    "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        )}>
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tpl.title}</h3>
                                                <Badge className="text-[7px] h-3.5 py-0 bg-muted text-muted-foreground border-border font-mono">{tpl.version}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{tpl.category}</span>
                                                <span className="text-border">•</span>
                                                <span className="text-[10px] text-muted-foreground font-medium italic">Updated: {tpl.lastUpdated}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(
                                            "text-[9px] h-4 py-0 uppercase border-transparent font-bold tracking-tighter",
                                            tpl.status === 'published' ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        )}>
                                            {tpl.status}
                                        </Badge>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" title="View Preview">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" title="Edit Template">
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Builder Intelligence Panel */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity grayscale hover:grayscale-0">
                            <PenTool className="h-28 w-28 text-primary" />
                        </div>
                        <div className="relative z-10 flex gap-6">
                            <div className="p-4 bg-primary/10 rounded-2xl h-fit border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                                <ShieldCheck className="h-7 w-7 text-primary" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground uppercase tracking-[0.1em] mb-1">
                                        {t('settings_registry.consents.dynamic_placeholders')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-medium">
                                        {t('settings_registry.consents.placeholders_desc')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['[PATIENT_NAME]', '[PROCEDURE_NAME]', '[PHYSICIAN_NAME]', '[FACILITY_ADDR]', '[SURGERY_DATE]'].map((tag) => (
                                        <button
                                            key={tag}
                                            className="px-2 py-1 bg-muted rounded border border-border text-[9px] font-mono font-bold text-primary hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <Button className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-9 px-8 shadow-lg shadow-primary/20 border-none transition-all hover:translate-y-[-1px]">
                                    {t('settings_registry.consents.builder')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registry Options Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-md p-5 space-y-6">
                        <div>
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" />
                                Catalog Explorer
                            </h2>
                            <div className="space-y-3">
                                <SidebarNav title={t('settings_registry.consents.surgical_consents')} count={12} active={true} />
                                <SidebarNav title={t('settings_registry.consents.general_forms')} count={41} />
                                <SidebarNav title="Patient Rights" count={5} />
                                <SidebarNav title="Research IRB" count={9} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-primary" />
                                Branching Logic
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                Legal approval is required for all templates in the Surgical category before they can be published.
                            </p>
                            <Button variant="outline" className="w-full text-[10px] font-bold uppercase h-9 border-border bg-background hover:bg-accent text-foreground">
                                Approval Workflow
                            </Button>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <PenTool className="h-20 w-20" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-amber-200">
                                <Info className="h-4 w-4" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] italic">Pro Designer</h3>
                            </div>
                            <p className="text-[10px] text-amber-50 leading-relaxed font-bold">
                                You can now embed QR codes into printed consent forms to securely link digital signatures back to the patient record.
                            </p>
                            <Button className="w-full h-9 bg-white text-orange-600 hover:bg-orange-50 text-[10px] font-bold uppercase border-none shadow-xl transition-all active:scale-95">
                                Enable Digital Link
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNav({ title, count, active }: { title: string, count: number, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer",
            active
                ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-sm"
                : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}>
            <span className="text-[11px] uppercase tracking-tight">{title}</span>
            <Badge variant="ghost" className={cn("text-[9px] h-4 py-0", active ? "text-primary" : "text-muted-foreground")}>{count}</Badge>
        </div>
    );
}
