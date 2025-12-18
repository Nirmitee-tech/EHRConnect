import React from 'react';
import { Palette, Upload } from 'lucide-react';
import { ThemeSettings } from '@/contexts/theme-context';
import { useTranslation } from '@/i18n/client';

interface BrandingSettingsProps {
    settings: ThemeSettings;
    onUpdate: (updates: Partial<ThemeSettings>) => void;
}

export const BrandingSettings = ({ settings, onUpdate }: BrandingSettingsProps) => {
    const { t } = useTranslation('common');

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            alert(t('appearance.upload_error_type'));
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(t('appearance.upload_error_size'));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onUpdate({ logoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">{t('appearance.logo_branding')}</h2>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                            {t('appearance.org_logo')}
                        </label>
                        <div className="flex items-center space-x-3">
                            {settings.logoUrl && (
                                <div className="w-14 h-14 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                                    <img
                                        src={settings.logoUrl}
                                        alt="Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            )}
                            <label className="cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                <div className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2">
                                    <Upload className="h-3.5 w-3.5" />
                                    <span>{t('appearance.upload')}</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                            {t('appearance.org_name')}
                        </label>
                        <input
                            type="text"
                            value={settings.orgNameOverride || ''}
                            onChange={(e) => onUpdate({ orgNameOverride: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                            placeholder={t('appearance.org_placeholder')}
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">{t('appearance.org_helper')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
