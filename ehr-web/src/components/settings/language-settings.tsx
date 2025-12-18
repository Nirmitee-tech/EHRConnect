'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/client';
import { languages, cookieName } from '@/i18n/settings';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Globe, Languages, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';

export function LanguageSettings() {
    const { t, i18n } = useTranslation('common');
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [justChanged, setJustChanged] = useState(false);

    const handleLanguageChange = async (value: string) => {
        setLoading(true);
        setJustChanged(false);
        try {
            // Update backend if session exists
            if (session) {
                await api.patch('/api/auth/me', { language: value }, { session });
            }

            // Update cookie
            Cookies.set(cookieName, value, { expires: 365 });

            // Update i18n instance
            await i18n.changeLanguage(value);

            setJustChanged(true);
            setTimeout(() => setJustChanged(false), 2000);

            // Force a full reload to ensure everything (layouts, server components, html tags) updates
            window.location.reload();
        } catch (error) {
            console.error('Failed to update language:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLanguageLabel = (lng: string) => {
        switch (lng) {
            case 'en': return { name: 'English', native: 'English', flag: '🇺🇸' };
            case 'es': return { name: 'Spanish', native: 'Español', flag: '🇪🇸' };
            case 'hi': return { name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' };
            case 'ur': return { name: 'Urdu', native: 'اردو', flag: '🇵🇰' };
            default: return { name: lng, native: lng, flag: '🌐' };
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                        <Languages className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">{t('appearance.system_language')}</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{t('appearance.language_desc')}</p>
                    </div>
                </div>
                {justChanged && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100 animate-in fade-in slide-in-from-right-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase">{t('appearance.applied')}</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{t('appearance.active_locale')}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-tighter">
                            {t('appearance.locale_helper')}
                        </p>
                    </div>

                    <div className="w-full md:w-[240px]">
                        <Select
                            value={i18n.language}
                            onValueChange={handleLanguageChange}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-[11px] font-bold h-10 px-3 hover:bg-white transition-colors">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent className="border-gray-200 shadow-xl rounded-xl">
                                {languages.map((lng) => {
                                    const meta = getLanguageLabel(lng);
                                    return (
                                        <SelectItem key={lng} value={lng} className="py-2.5 focus:bg-blue-50 focus:text-blue-600 cursor-pointer">
                                            <div className="flex items-center justify-between w-full min-w-[180px]">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-sm">{meta.flag}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold tracking-tight">{meta.name}</span>
                                                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{meta.native}</span>
                                                    </div>
                                                </div>
                                                {i18n.language === lng && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded border border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            ISO: {i18n.language?.toUpperCase()}
                        </div>
                        <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">
                            {i18n.language === 'ur' ? t('appearance.rtl_support') : t('appearance.ltr_support')}
                        </div>
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{t('appearance.updating')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
