'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Utensils, Apple,
    ShieldAlert, ClipboardList, ChefHat, ChevronRight,
    Filter, Info, Zap, Database, ShoppingCart,
    Scale, Salad, Soup, Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface DietPlan {
    id: string;
    name: string;
    type: 'Therapeutic' | 'Standard' | 'Religion-Based' | 'Allergy-Safe';
    constraints: string;
    caloricRange: string;
    status: 'Active' | 'Under Review';
}

export default function DietaryMastersPage() {
    const { t } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');

    const [plans] = useState<DietPlan[]>([
        { id: '1', name: 'Low-Sodium (Cardiac)', type: 'Therapeutic', constraints: 'Na < 2000mg, No Salt-Sub', caloricRange: '1800-2200 kcal', status: 'Active' },
        { id: '2', name: 'Renal (Non-Dialysis)', type: 'Therapeutic', constraints: 'Low Protein, Low K+, Low Phos', caloricRange: '2000 kcal', status: 'Active' },
        { id: '3', name: 'Clear Liquid', type: 'Standard', constraints: 'No solids, no pulp', caloricRange: '400-600 kcal', status: 'Active' },
        { id: '4', name: 'Halal Certified', type: 'Religion-Based', constraints: 'No Pork, Sharia-Compliant Prep', caloricRange: 'Varies', status: 'Active' },
        { id: '5', name: 'Strict Vegan', type: 'Standard', constraints: 'No animal products', caloricRange: '1800-2500 kcal', status: 'Under Review' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
                <div className="flex items-center gap-5">
                    <Link
                        href="/settings"
                        className="p-3 bg-white hover:bg-orange-50 rounded-2xl transition-all border border-orange-100 group shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-orange-400 group-hover:text-orange-600 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
                            Dietary Masters
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 ring-1 ring-orange-500/20">
                                <Utensils className="h-6 w-6" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">Nutritional constraints, meal logic & kitchen orchestration</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-orange-100 text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
                        <Salad className="h-4 w-4" />
                        Kitchen Workflow
                    </Button>
                    <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 transition-all hover:translate-y-[-2px] border-none">
                        <Plus className="h-4 w-4" />
                        Create Diet Master
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Diet Registry */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-300 group-focus-within:text-orange-500 transition-colors" />
                            <Input
                                placeholder="Search diets (Soft, Cardiac, Diabetic, etc.)..."
                                className="pl-11 h-12 bg-white border-orange-100 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-orange-100 p-0 bg-white text-orange-400">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-2xl overflow-hidden border-t-4 border-t-orange-500">
                        <div className="p-6 bg-orange-50/20 border-b border-orange-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-orange-600">
                                <ChefHat className="h-5 w-5" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Therapeutic Diet Catalog</h2>
                            </div>
                            <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-3 h-5 font-bold uppercase tracking-widest leading-none">
                                HACCP Compliant
                            </Badge>
                        </div>

                        <div className="divide-y divide-orange-50">
                            {plans.map((plan) => (
                                <div key={plan.id} className="p-6 flex items-center justify-between hover:bg-orange-50/50 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner border",
                                            plan.type === 'Therapeutic' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            {plan.type === 'Therapeutic' ? <Apple className="h-5 w-5" /> : <Soup className="h-5 w-5" />}
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight">{plan.name}</h3>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 px-2 font-black uppercase border-none tracking-widest px-2 py-0.5",
                                                    plan.type === 'Therapeutic' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                                                )}>
                                                    {plan.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <span className="text-orange-600/70 font-black">{plan.caloricRange}</span>
                                                <div className="w-1 h-1 rounded-full bg-orange-100" />
                                                <span className="italic">{plan.constraints}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-[10px] font-black text-foreground tracking-wider uppercase">Meal Prep Logic</div>
                                            <div className="text-[8px] text-orange-400 font-bold uppercase tracking-widest">Batch Group 4</div>
                                        </div>
                                        <div className="p-2 rounded-xl group-hover/item:bg-orange-500/10 transition-colors bg-orange-50">
                                            <ChevronRight className="h-5 w-5 text-orange-300 group-hover/item:text-orange-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Nutrition Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/intel border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:scale-110 transition-transform duration-1000">
                            <ShoppingCart className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-orange-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-300">Safety Intercepts</h3>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-white/50 border-l-2 border-orange-500/30 pl-4">
                                "Allergy cross-checks are active. Nutritional intake triggers automatically sync to the metabolic flow sheet."
                            </p>

                            <div className="space-y-6">
                                <DietMetric label="Allergy Conflict" value="Active" detail="Hard Stop Mode" />
                                <DietMetric label="Menu Variance" value="< 2%" detail="Kitchen QC" />
                                <DietMetric label="Inventory Link" value="Live" detail="Stock Sync" />
                            </div>

                            <Button className="w-full bg-orange-600 hover:bg-orange-500 h-11 text-[10px] font-bold uppercase tracking-widest shadow-xl border-none">
                                Recipe Master Audit
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-orange-100 rounded-[2.5rem] shadow-xl space-y-6 relative group overflow-hidden">
                        <div className="flex items-center gap-3 text-orange-500">
                            <ClipboardList className="h-5 w-5" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Kitchen Orchestration</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100 group-hover:bg-orange-100/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Coffee className="h-4 w-4 text-orange-400" />
                                    <span className="text-[10px] font-black text-orange-700 uppercase">Tray Tracking</span>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-4">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100 group-hover:bg-orange-100/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <Scale className="h-4 w-4 text-orange-400" />
                                    <span className="text-[10px] font-black text-orange-700 uppercase">Input/Output Link</span>
                                </div>
                                <Zap className="h-4 w-4 text-amber-500" />
                            </div>
                        </div>

                        <Button className="w-full h-11 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                            <Database className="h-4 w-4" />
                            Legacy Sync
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DietMetric({ label, value, detail }: { label: string, value: string, detail: string }) {
    return (
        <div className="space-y-1 group/metric cursor-default">
            <div className="flex justify-between items-center text-white/40 font-bold uppercase text-[9px] tracking-widest group-hover/metric:text-orange-400 transition-colors">
                <span>{label}</span>
                <span className="text-white text-[13px] font-black">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: '100%' }} />
                </div>
                <span className="text-[8px] font-bold text-white/25 uppercase">{detail}</span>
            </div>
        </div>
    );
}
