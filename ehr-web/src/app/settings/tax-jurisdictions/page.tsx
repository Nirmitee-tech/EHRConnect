'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Landmark, Plus, Search, HelpCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';

interface Jurisdiction {
    id: string;
    name: string;
    region: string;
    taxNumber: string;
    rate: string;
    type: 'GST' | 'VAT' | 'Sales Tax' | 'Other';
    status: 'active' | 'inactive';
}

export default function TaxJurisdictionsPage() {
    const { t } = useTranslation('common');
    const toast = useToast();
    const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([
        { id: '1', name: 'Federal Health Tax', region: 'National', taxNumber: 'TX-9901', rate: '5%', type: 'VAT', status: 'active' },
        { id: '2', name: 'State Medical Surcharge', region: 'California', taxNumber: 'CA-4421', rate: '2.5%', type: 'Sales Tax', status: 'active' },
    ]);

    const handleSave = () => {
        toast.success(t('settings_registry.tax_jurisdictions.save_protocol'));
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                            {t('settings_registry.tax_jurisdictions.title')}
                            <Landmark className="h-5 w-5 text-primary" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.tax_jurisdictions.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Guide
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4" />
                        {t('settings_registry.tax_jurisdictions.save_protocol')}
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Registry List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings_registry.tax_jurisdictions.active_jurisdictions')}</h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Search regions..." className="pl-8 h-8 text-xs w-[200px] border-border bg-background" />
                                </div>
                                <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90">
                                    <Plus className="h-3.5 w-3.5" />
                                    {t('settings_registry.tax_jurisdictions.add_new')}
                                </Button>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {jurisdictions.map(j => (
                                <div key={j.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {j.region.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">{j.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase">{j.region}</span>
                                                <span className="text-border">•</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{j.taxNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-foreground">{j.rate}</div>
                                            <Badge variant="outline" className="text-[9px] h-4 font-bold uppercase py-0 border-border text-muted-foreground">{j.type}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground">
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-destructive text-muted-foreground">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                        <div className="p-2 bg-amber-500/20 rounded text-amber-600 dark:text-amber-400 h-fit">
                            <HelpCircle className="h-4 w-4" />
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                            <p className="font-bold uppercase tracking-tight mb-1">Tax Calculation Logic</p>
                            These jurisdictions are automatically applied to patient invoices based on the facility location and service type.
                            Ensure all tax IDs are verified for HIPAA and regional compliance.
                        </div>
                    </div>
                </div>

                {/* Configuration Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">{t('settings_registry.tax_jurisdictions.global_settings')}</h2>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground">{t('settings_registry.tax_jurisdictions.calculation_method')}</Label>
                                <select className="w-full h-9 rounded-md border border-border bg-muted/50 px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option>Destination-based (Shipping/Facility)</option>
                                    <option>Origin-based (Provider Location)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground">{t('settings_registry.tax_jurisdictions.tax_inclusive')}</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="checkbox" id="inclusive" className="rounded border-border bg-background text-primary focus:ring-primary" />
                                    <span className="text-xs text-muted-foreground">{t('settings_registry.tax_jurisdictions.inclusive_desc')}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border mt-4">
                                <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-tight h-10 border border-border bg-muted hover:bg-muted/80">
                                    {t('settings_registry.tax_jurisdictions.manage_codes')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary rounded-xl shadow-lg p-5 text-primary-foreground">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            {t('settings_registry.tax_jurisdictions.pro_tip_title')}
                            <Edit2 className="h-4 w-4" />
                        </h3>
                        <p className="text-xs text-primary-foreground/80 leading-relaxed mb-4 font-medium">
                            {t('settings_registry.tax_jurisdictions.pro_tip_desc')}
                        </p>
                        <Button variant="secondary" className="w-full h-9 bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground text-[10px] font-bold uppercase">
                            {t('settings_registry.tax_jurisdictions.configure_surcharges')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

