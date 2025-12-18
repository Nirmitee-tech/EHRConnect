import React, { useState } from 'react';
import { Palette, Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PRESET_THEMES, PresetTheme } from '@/config/themes.config';
import { cn } from '@/lib/utils';
import { ThemeSettings } from '@/contexts/theme-context';
import { useTranslation } from '@/i18n/client';

interface ThemeLibraryProps {
    currentSettings: ThemeSettings;
    onApplyTheme: (theme: PresetTheme) => void;
}

export const ThemeLibrary = ({ currentSettings, onApplyTheme }: ThemeLibraryProps) => {
    const { t } = useTranslation('common');
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'All' | 'Modern' | 'Classic' | 'Dark' | 'Special' | 'EMR'>('All');

    const categories = ['EMR', 'Modern', 'Classic', 'Dark', 'Special'] as const;

    const getTranslatedCategory = (cat: string) => {
        // Translation keys for categories could be added later, currently using as-is but providing structure
        // dashboard.cardiology etc are examples, using common.all for 'All'
        if (cat === 'All') return t('common.all') || 'All';
        return cat;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold text-gray-900">{t('appearance.theme_library')}</h2>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">{PRESET_THEMES.length} {t('appearance.premium_styles')}</span>
                </div>
                {isLibraryOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isLibraryOpen && (
                <div className="p-4 pt-0 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col md:flex-row gap-3 mb-4 mt-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('appearance.search_themes')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {(['All', ...categories] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-tighter",
                                        activeCategory === cat
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    )}
                                >
                                    {getTranslatedCategory(cat)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1 custom-scrollbar">
                        {categories
                            .filter(cat => activeCategory === 'All' || activeCategory === cat)
                            .map((category) => {
                                const filteredThemes = PRESET_THEMES.filter(t =>
                                    t.category === category &&
                                    (searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                );

                                if (filteredThemes.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="flex items-center space-x-2 px-1">
                                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</h3>
                                            <div className="h-px flex-1 bg-gray-100" />
                                            <span className="text-[9px] text-gray-400 font-mono">{filteredThemes.length}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {filteredThemes.map((theme) => {
                                                const isSelected = currentSettings.primaryColor === theme.primaryColor &&
                                                    currentSettings.sidebarBackgroundColor === theme.sidebarBackgroundColor;
                                                return (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => onApplyTheme(theme)}
                                                        className={cn(
                                                            "group relative aspect-square rounded-lg border-2 transition-all p-1 flex flex-col hover:shadow-md",
                                                            isSelected
                                                                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                                                                : "border-transparent bg-gray-50/50 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className="flex-1 rounded-md overflow-hidden flex flex-col shadow-sm">
                                                            <div className="h-1/3" style={{ backgroundColor: theme.primaryColor }} />
                                                            <div className="h-2/3 flex">
                                                                <div className="w-1/3" style={{ backgroundColor: theme.sidebarBackgroundColor }} />
                                                                <div className="w-2/3 bg-white" />
                                                            </div>
                                                        </div>
                                                        <span className="mt-1 text-[9px] font-bold text-gray-700 truncate w-full text-center group-hover:text-primary transition-colors px-0.5">
                                                            {theme.name}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute top-0.5 right-0.5 bg-primary text-white p-0.5 rounded-full shadow-lg">
                                                                <Check className="h-2 w-2" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        {searchQuery !== '' && PRESET_THEMES.filter(t =>
                            (activeCategory === 'All' || t.category === activeCategory) &&
                            t.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-xs text-gray-400 font-medium">{t('appearance.no_themes_found')} "{searchQuery}"</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-2 text-[10px] text-primary font-bold uppercase hover:underline"
                                    >
                                        {t('appearance.clear_search')}
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
};
