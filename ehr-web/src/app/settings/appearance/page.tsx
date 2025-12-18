'use client';

import React, { useState } from 'react';
import { useTheme, defaultTheme, ThemeSettings } from '@/contexts/theme-context';
import { useFacility } from '@/contexts/facility-context';
import { Save, RotateCcw, Eye } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';
import { HeaderActions } from '@/components/layout/header-actions';
import { Button } from '@/components/ui/button';
import { PresetTheme } from '@/config/themes.config';

// Modular Components
import { ThemeLibrary } from './components/theme-library';
import { BrandingSettings } from './components/branding-settings';
import { ColorSettings } from './components/color-settings';
import { TypographySettings } from './components/typography-settings';
import { LivePreview } from './components/live-preview';
import { LanguageSettings } from '@/components/settings/language-settings';
import { Globe } from 'lucide-react';

export default function AppearancePage() {
  const { themeSettings, updateTheme, resetTheme, isLoading, error } = useTheme();
  const { refreshFacilities, currentFacility } = useFacility();
  const [localSettings, setLocalSettings] = useState(themeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local settings when theme changes or facility is loaded
  React.useEffect(() => {
    setLocalSettings({
      ...themeSettings,
      orgNameOverride: themeSettings.orgNameOverride || currentFacility?.name || ''
    });
  }, [themeSettings, currentFacility]);

  const handleUpdateSettings = (updates: Partial<ThemeSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  const handleColorChange = (field: keyof ThemeSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const applyPresetTheme = (theme: PresetTheme) => {
    setLocalSettings({
      ...localSettings,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      sidebarBackgroundColor: theme.sidebarBackgroundColor,
      sidebarTextColor: theme.sidebarTextColor,
      sidebarActiveColor: theme.sidebarActiveColor,
      sidebarActiveTextColor: theme.sidebarActiveTextColor || null,
      primaryTextColor: theme.primaryTextColor || null,
      accentColor: theme.accentColor,
      fontFamily: theme.fontFamily
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateTheme(localSettings);
      await refreshFacilities();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save theme:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to default theme?')) {
      setIsSaving(true);
      try {
        await resetTheme();
        setLocalSettings(defaultTheme);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to reset theme:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <HeaderActions target="tabbar">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white hover:opacity-90 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </HeaderActions>

      {/* Status Messages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-4">
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-xs font-medium text-green-800">Changes successfully synced to cloud</p>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-4">
            <ThemeLibrary
              currentSettings={localSettings}
              onApplyTheme={applyPresetTheme}
            />

            <BrandingSettings
              settings={localSettings}
              onUpdate={handleUpdateSettings}
            />

            <ColorSettings
              settings={localSettings}
              onColorChange={handleColorChange}
            />

            <TypographySettings
              currentFont={localSettings.fontFamily}
              onFontChange={(font) => handleUpdateSettings({ fontFamily: font })}
            />

            {/* Regional & Localization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Globe className="h-4 w-4 text-gray-400" />
                <h2 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">Regional & Localization</h2>
              </div>
              <LanguageSettings />
            </div>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div className="lg:col-span-12 xl:col-span-5">
              <div className="xl:sticky xl:top-4">
                <LivePreview settings={localSettings} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
