'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Search, ShieldAlert, Plus, Filter, Info,
    AlertTriangle, Pill, Apple, Wind, Settings2,
    ShieldCheck, Trash2, Edit3, HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

type AllergyCategory = 'Medication' | 'Food' | 'Environmental';

interface Allergen {
    id: string;
    name: string;
    category: AllergyCategory;
    commonReactions: string[];
    riskLevel: 'high' | 'moderate' | 'low';
}

export default function AllergyDatabasePage() {
    const { t } = useTranslation('common');
    const [activeCategory, setActiveCategory] = useState<AllergyCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [allergens] = useState<Allergen[]>([
        { id: '1', name: 'Penicillin G', category: 'Medication', commonReactions: ['Anaphylaxis', 'Urticaria', 'Angioedema'], riskLevel: 'high' },
        { id: '2', name: 'Peanuts / Tree Nuts', category: 'Food', commonReactions: ['Anaphylaxis', 'Airway Obstruction'], riskLevel: 'high' },
        { id: '3', name: 'Latex (Natural Rubber)', category: 'Environmental', commonReactions: ['Contact Dermatitis', 'Asthma'], riskLevel: 'moderate' },
        { id: '4', name: 'Aspirin (NSAIDs)', category: 'Medication', commonReactions: ['Bronchospasm', 'Gastrointestinal Bleeding'], riskLevel: 'moderate' },
        { id: '5', name: 'Ragweed Pollen', category: 'Environmental', commonReactions: ['Allergic Rhinitis', 'Conjunctivitis'], riskLevel: 'low' },
        { id: '6', name: 'Sulfa Drugs', category: 'Medication', commonReactions: ['Stevens-Johnson Syndrome', 'Toxic Epidermal Necrolysis'], riskLevel: 'high' },
        { id: '7', name: 'Shellfish', category: 'Food', commonReactions: ['Abdominal Pain', 'Vomiting'], riskLevel: 'moderate' },
        { id: '8', name: 'Contrast Media (Iodine)', category: 'Medication', commonReactions: ['Contrast-Induced Nephropathy', 'Anaphylactoid Reaction'], riskLevel: 'high' },
    ]);

    const filteredAllergens = allergens.filter(a => {
        const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.commonReactions.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

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
                            {t('settings_registry.allergies.title')}
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.allergies.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border hover:bg-accent">
                        <Settings2 className="h-4 w-4" />
                        {t('settings_registry.allergies.reaction_types')}
                    </Button>
                    <Button className="gap-2 bg-destructive hover:bg-destructive/90 text-[10px] font-bold uppercase shadow-sm text-destructive-foreground">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.allergies.add_allergen')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border shadow-inner overflow-x-auto max-w-full">
                            {(['All', 'Medication', 'Food', 'Environmental'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-widest whitespace-nowrap",
                                        activeCategory === cat
                                            ? "bg-background text-foreground shadow-md ring-1 ring-border"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    {cat === 'All' ? 'Global Catalog' : cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative group w-full sm:w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder={t('settings_registry.allergies.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 text-xs w-full bg-background border-border focus:ring-2 focus:ring-primary/10 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Allergen List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAllergens.map((allergen) => (
                            <div key={allergen.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                <div className={cn(
                                    "absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2",
                                    allergen.riskLevel === 'high' ? "bg-destructive shadow-[4px_0_12px_rgba(239,68,68,0.3)]" :
                                        allergen.riskLevel === 'moderate' ? "bg-amber-500 shadow-[4px_0_12px_rgba(245,158,11,0.3)]" :
                                            "bg-blue-500 shadow-[4px_0_12px_rgba(59,130,246,0.3)]"
                                )} />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            allergen.category === 'Medication' ? "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                                                allergen.category === 'Food' ? "bg-green-500/10 text-green-600 group-hover:bg-green-600 group-hover:text-white" :
                                                    "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                                        )}>
                                            {allergen.category === 'Medication' && <Pill className="h-5 w-5" />}
                                            {allergen.category === 'Food' && <Apple className="h-5 w-5" />}
                                            {allergen.category === 'Environmental' && <Wind className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{allergen.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {allergen.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "text-[9px] h-5 px-2 py-0 uppercase border-none font-bold shadow-sm",
                                        allergen.riskLevel === 'high' ? "bg-destructive text-destructive-foreground" :
                                            allergen.riskLevel === 'moderate' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                    )}>
                                        {allergen.riskLevel} Risk
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-[1px] flex-1 bg-border" />
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <HeartPulse className="h-3 w-3 text-destructive/60" />
                                            Clinical Reactions
                                        </div>
                                        <div className="h-[1px] flex-1 bg-border" />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allergen.commonReactions.map((reaction, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-background border border-border rounded-md text-[10px] font-semibold text-foreground/80 hover:border-primary/30 hover:text-primary transition-colors shadow-sm">
                                                {reaction}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-border flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase gap-2 hover:bg-accent">
                                        <Edit3 className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase gap-2 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cross-Sensitivity Rule Engine */}
                    <div className="bg-muted/50 border border-border rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <ShieldCheck className="h-32 w-32 text-primary" />
                        </div>
                        <div className="relative z-10 flex gap-6">
                            <div className="p-3 bg-primary/10 rounded-2xl h-fit border border-primary/20 shadow-inner">
                                <GitBranchIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground uppercase tracking-[0.1em] mb-1">
                                        {t('settings_registry.allergies.cross_sensitivity')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-medium">
                                        {t('settings_registry.allergies.cross_desc')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-muted-foreground uppercase">
                                            <span>Beta-Lactam Group</span>
                                            <Badge className="bg-primary/10 text-primary border-none text-[8px] h-3">Active</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="p-1 px-2 bg-muted rounded border border-border text-[10px] font-mono font-bold">Penicillins</span>
                                            <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                                            <span className="p-1 px-2 bg-muted rounded border border-border text-[10px] font-mono font-bold">Cephalosporins</span>
                                        </div>
                                    </div>
                                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-muted-foreground uppercase">
                                            <span>NSAID Cross-reactivity</span>
                                            <Badge className="bg-primary/10 text-primary border-none text-[8px] h-3">Active</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="p-1 px-2 bg-muted rounded border border-border text-[10px] font-mono font-bold">Aspirin</span>
                                            <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                                            <span className="p-1 px-2 bg-muted rounded border border-border text-[10px] font-mono font-bold">Ibuprofen</span>
                                        </div>
                                    </div>
                                </div>
                                <Button className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-9 px-8 shadow-lg shadow-primary/20 border-none">
                                    Manage Logic Clusters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-md p-5 space-y-6">
                        <div>
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <ActivityIcon className="h-3.5 w-3.5 text-primary" />
                                Statistics
                            </h2>
                            <div className="space-y-4">
                                <StatItem label="Active Allergens" value="1,248" trend="+12" />
                                <StatItem label="Reaction Types" value="42" />
                                <StatItem label="Safety Rules" value="18" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Wind className="h-3.5 w-3.5 text-primary" />
                                Safety Audit
                            </h2>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium mb-4">
                                Internal DB sync completed 4 hours ago. All allergens mapped to SNOMED-CT 2024.
                            </p>
                            <Button variant="outline" className="w-full text-[10px] font-bold uppercase h-9 border-border bg-background hover:bg-accent text-foreground">
                                {t('settings_registry.allergies.export_safety_data')}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-red-600 rounded-xl p-5 text-red-50 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <AlertTriangle className="h-20 w-20" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-red-200" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-100 italic">Safety Recall</h3>
                            </div>
                            <p className="text-[10px] text-red-50/80 leading-relaxed font-bold">
                                Global recall issued for Batches of Amoxicillin (Mfr: BioMed). Automatic alerts active for all new prescriptions.
                            </p>
                            <Button variant="secondary" className="w-full h-8 bg-white/10 hover:bg-white/20 border-white/20 text-white text-[9px] font-bold uppercase shadow-inner">
                                View Recall Details
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, trend }: { label: string, value: string, trend?: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground font-mono">{value}</span>
                {trend && <span className="text-[8px] font-bold text-green-500">{trend}</span>}
            </div>
        </div>
    );
}

function GitBranchIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
        </svg>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    );
}
