'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Globe2, Plus, Search, HelpCircle, Download, CheckCircle, Languages as LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';

interface LanguagePack {
    id: string;
    name: string;
    code: string;
    completeness: number;
    status: 'installed' | 'available' | 'updating';
    isDefault?: boolean;
}

export default function LanguagePacksPage() {
    const { t } = useTranslation('common');
    const toast = useToast();
    const [languages, setLanguages] = useState<LanguagePack[]>([
        { id: '1', name: 'English (US)', code: 'en-US', completeness: 100, status: 'installed', isDefault: true },
        { id: '2', name: 'Spanish (Latin America)', code: 'es-LA', completeness: 94, status: 'installed' },
        { id: '3', name: 'French (France)', code: 'fr-FR', completeness: 88, status: 'available' },
        { id: '4', name: 'German (Germany)', code: 'de-DE', completeness: 100, status: 'available' },
    ]);

    const handleSave = () => {
        toast.success(t('settings_registry.languages.update_registry'));
    };

    const handleInstall = (id: string) => {
        setLanguages(prev => prev.map(l => l.id === id ? { ...l, status: 'updating' } : l));
        setTimeout(() => {
            setLanguages(prev => prev.map(l => l.id === id ? { ...l, status: 'installed' } : l));
            toast.success(t('settings_registry.languages.ready'));
        }, 2000);
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
                            {t('settings_registry.languages.title')}
                            <Globe2 className="h-5 w-5 text-primary" />
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">{t('settings_registry.languages.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Translation Help
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4" />
                        {t('settings_registry.languages.update_registry')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-card rounded-xl border border-border shadow-sm">
                        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings_registry.languages.installed_packs')}</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input placeholder={t('settings_registry.languages.filter_languages')} className="pl-8 h-8 text-xs w-[180px] bg-background border-border" />
                            </div>
                        </div>

                        <div className="divide-y divide-border text-xs">
                            {languages.map(lang => (
                                <div key={lang.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                            {lang.code.split('-')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">{lang.name}</span>
                                                {lang.isDefault && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] h-4 py-0 uppercase shadow-none font-bold">Default</Badge>}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase">{lang.code}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="w-32">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] text-muted-foreground">{t('settings_registry.languages.coverage')}</span>
                                                <span className="text-[10px] font-bold text-foreground">{lang.completeness}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${lang.completeness === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                    style={{ width: `${lang.completeness}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            {lang.status === 'installed' ? (
                                                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-bold uppercase tracking-tighter">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {t('settings_registry.languages.ready')}
                                                </div>
                                            ) : lang.status === 'updating' ? (
                                                <div className="flex items-center gap-1.5 text-primary animate-pulse font-bold uppercase tracking-tighter">
                                                    {t('settings_registry.languages.installing')}
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1.5 px-3 uppercase font-bold border-border hover:bg-accent text-muted-foreground hover:text-foreground" onClick={() => handleInstall(lang.id)}>
                                                    <Download className="h-3 w-3" />
                                                    {t('settings_registry.languages.download')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4">
                        <div className="p-2 bg-primary/20 rounded h-fit">
                            <Globe2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider">{t('settings_registry.languages.crowdsource_title')}</h3>
                            <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                                {t('settings_registry.languages.crowdsource_desc')}
                            </p>
                            <button className="text-[10px] font-bold text-primary uppercase underline mt-2 hover:opacity-80 transition-opacity">{t('settings_registry.languages.connect_tms')}</button>
                        </div>
                    </div>
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">{t('settings_registry.languages.local_formatting')}</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('settings_registry.languages.default_currency')}</label>
                                <select className="w-full h-9 rounded-md border border-border bg-muted/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option>USD ($) - United States</option>
                                    <option>EUR (€) - Eurozone</option>
                                    <option>GBP (£) - United Kingdom</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('settings_registry.languages.number_format')}</label>
                                <select className="w-full h-9 rounded-md border border-border bg-muted/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option>1,234.56 (Decimal Point)</option>
                                    <option>1.234,56 (Decimal Comma)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('settings_registry.languages.character_encoding')}</label>
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border">
                                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">UTF-8 Regular (Standard)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5 text-foreground shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Plus className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">{t('settings_registry.languages.add_custom_key')}</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-4 font-medium">
                            {t('settings_registry.languages.custom_key_desc')}
                        </p>
                        <div className="space-y-2">
                            <Input placeholder="key_identifier" className="h-8 bg-background border-border text-xs text-foreground focus:ring-1 focus:ring-primary" />
                            <Button className="w-full h-8 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase">
                                {t('settings_registry.languages.open_editor')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

