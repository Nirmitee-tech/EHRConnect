import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeSettings } from '@/contexts/theme-context';
import { useTranslation } from '@/i18n/client';

interface TypographySettingsProps {
    currentFont: string;
    onFontChange: (font: string) => void;
}

export const TypographySettings = ({ currentFont, onFontChange }: TypographySettingsProps) => {
    const { t } = useTranslation('common');
    const fonts = [
        { label: 'Inter (Default)', value: 'Inter, sans-serif' },
        { label: 'Roboto', value: 'Roboto, sans-serif' },
        { label: 'Open Sans', value: 'Open Sans, sans-serif' },
        { label: 'Lato', value: 'Lato, sans-serif' },
        { label: 'Poppins', value: 'Poppins, sans-serif' },
        { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold text-gray-900">{t('appearance.typography')}</h2>
                </div>
                <select
                    value={currentFont}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-48 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                >
                    {fonts.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
