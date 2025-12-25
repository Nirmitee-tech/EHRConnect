import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeSettings } from '@/contexts/theme-context';
import { ColorInput } from './color-input';
import { useTranslation } from '@/i18n/client';

interface ColorSettingsProps {
    settings: ThemeSettings;
    onColorChange: (field: keyof ThemeSettings, value: string) => void;
}

export const ColorSettings = ({ settings, onColorChange }: ColorSettingsProps) => {
    const { t } = useTranslation('common');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">{t('appearance.theme_colors')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <ColorInput
                    label={t('appearance.color_primary')}
                    field="primaryColor"
                    description={t('appearance.color_primary_desc')}
                    value={settings.primaryColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_primary_text')}
                    field="primaryTextColor"
                    description={t('appearance.color_primary_text_desc')}
                    value={settings.primaryTextColor || ''}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_sidebar_bg')}
                    field="sidebarBackgroundColor"
                    description={t('appearance.color_sidebar_bg_desc')}
                    value={settings.sidebarBackgroundColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_sidebar_text')}
                    field="sidebarTextColor"
                    description={t('appearance.color_sidebar_text_desc')}
                    value={settings.sidebarTextColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_active_menu')}
                    field="sidebarActiveColor"
                    description={t('appearance.color_active_menu_desc')}
                    value={settings.sidebarActiveColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_active_text')}
                    field="sidebarActiveTextColor"
                    description={t('appearance.color_active_text_desc')}
                    value={settings.sidebarActiveTextColor || ''}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_secondary')}
                    field="secondaryColor"
                    description={t('appearance.color_secondary_desc')}
                    value={settings.secondaryColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_accent')}
                    field="accentColor"
                    description={t('appearance.color_accent_desc')}
                    value={settings.accentColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_tertiary')}
                    field="tertiaryColor"
                    description={t('appearance.color_tertiary_desc')}
                    value={settings.tertiaryColor || '#F59E0B'}
                    onChange={onColorChange}
                />
                <ColorInput
                    label={t('appearance.color_quaternary')}
                    field="quaternaryColor"
                    description={t('appearance.color_quaternary_desc')}
                    value={settings.quaternaryColor || '#8B5CF6'}
                    onChange={onColorChange}
                />
            </div>
        </div>
    );
};
