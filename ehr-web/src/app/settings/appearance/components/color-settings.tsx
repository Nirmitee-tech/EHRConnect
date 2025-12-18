import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeSettings } from '@/contexts/theme-context';
import { ColorInput } from './color-input';

interface ColorSettingsProps {
    settings: ThemeSettings;
    onColorChange: (field: keyof ThemeSettings, value: string) => void;
}

export const ColorSettings = ({ settings, onColorChange }: ColorSettingsProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">Theme Colors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <ColorInput
                    label="Primary"
                    field="primaryColor"
                    description="Buttons & highlights"
                    value={settings.primaryColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Primary Text"
                    field="primaryTextColor"
                    description="Text on primary bg"
                    value={settings.primaryTextColor || ''}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Sidebar Bg"
                    field="sidebarBackgroundColor"
                    description="Sidebar background"
                    value={settings.sidebarBackgroundColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Sidebar Text"
                    field="sidebarTextColor"
                    description="Inactive menu items"
                    value={settings.sidebarTextColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Active Menu"
                    field="sidebarActiveColor"
                    description="Selected highlight"
                    value={settings.sidebarActiveColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Active Text"
                    field="sidebarActiveTextColor"
                    description="Text on active menu"
                    value={settings.sidebarActiveTextColor || ''}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Secondary"
                    field="secondaryColor"
                    description="Secondary actions"
                    value={settings.secondaryColor}
                    onChange={onColorChange}
                />
                <ColorInput
                    label="Accent"
                    field="accentColor"
                    description="Status indicators"
                    value={settings.accentColor}
                    onChange={onColorChange}
                />
            </div>
        </div>
    );
};
