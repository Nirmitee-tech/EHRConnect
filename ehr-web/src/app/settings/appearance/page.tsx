'use client';

import React, { useState } from 'react';
import { useTheme, defaultTheme, ThemeSettings } from '@/contexts/theme-context';
import { useFacility } from '@/contexts/facility-context';
import { Palette, Save, RotateCcw, Upload, Eye, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { HeaderActions } from '@/components/layout/header-actions';
import { Button } from '@/components/ui/button';
import { PRESET_THEMES, PresetTheme } from '@/config/themes.config';
import { cn, getContrastColor } from '@/lib/utils';

export default function AppearancePage() {
  const { themeSettings, updateTheme, resetTheme, isLoading, error } = useTheme();
  const { refreshFacilities, currentFacility } = useFacility();
  const [localSettings, setLocalSettings] = useState(themeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Modern' | 'Classic' | 'Dark' | 'Special' | 'EMR'>('All');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Update local settings when theme changes
  React.useEffect(() => {
    setLocalSettings({
      ...themeSettings,
      orgNameOverride: themeSettings.orgNameOverride || currentFacility?.name || ''
    });
  }, [themeSettings, currentFacility]);

  const handleColorChange = (field: keyof typeof localSettings, value: string) => {
    // Only accept 6-digit hex or valid strings
    // Backend has strict validation for #RRGGBB
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
      // Error is already set in the context
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    // TODO: Replace with custom confirmation modal for better UX
    // For now using native confirm - should be replaced with a custom modal component
    if (confirm('Are you sure you want to reset to default theme?')) {
      setIsSaving(true);
      try {
        await resetTheme();
        setLocalSettings(defaultTheme);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to reset theme:', err);
        // Error is already set in the context
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, or SVG)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('File size must be less than 2MB');
      return;
    }

    // For now, we'll use a data URL. In production, upload to cloud storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLocalSettings({ ...localSettings, logoUrl: dataUrl });
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const ColorInput = ({
    label,
    field,
    description
  }: {
    label: string;
    field: keyof ThemeSettings;
    description: string;
  }) => (
    <div className="flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-900 truncate">{label}</label>
        <p className="text-[10px] text-gray-500 truncate">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="relative w-8 h-8 rounded-md border border-gray-200 overflow-hidden shadow-sm shrink-0 transition-transform active:scale-90"
          style={{ backgroundColor: (localSettings[field] as string) || 'transparent' }}
        >
          <input
            type="color"
            value={(localSettings[field] as string) || '#ffffff'}
            onInput={(e) => handleColorChange(field, (e.target as HTMLInputElement).value)}
            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0"
          />
        </div>
        <input
          type="text"
          value={(localSettings[field] as string) || ''}
          onChange={(e) => handleColorChange(field, e.target.value)}
          className="w-20 px-2 py-1 text-[11px] font-mono border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
          placeholder="Auto"
          maxLength={7}
        />
        {!(localSettings[field]) && (
          <span className="text-[9px] text-primary font-bold uppercase tracking-tighter">Smart</span>
        )}
      </div>
    </div>
  );

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

      {/* Success Message */}
      {saveSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-xs font-medium text-green-800">Changes successfully synced to cloud</p>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-4">

            {/* Theme Library */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-gray-900">Theme Library</h2>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">{PRESET_THEMES.length} Premium Styles</span>
                </div>
                {isLibraryOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {isLibraryOpen && (
                <div className="p-4 pt-0 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Search & Categories */}
                  <div className="flex flex-col md:flex-row gap-3 mb-4 mt-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search themes by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(['All', 'EMR', 'Modern', 'Classic', 'Dark', 'Special'] as const).map((cat) => (
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
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1 custom-scrollbar">
                    {(['EMR', 'Modern', 'Classic', 'Dark', 'Special'] as const)
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
                              {filteredThemes.map((theme) => (
                                <button
                                  key={theme.id}
                                  onClick={() => applyPresetTheme(theme)}
                                  className={cn(
                                    "group relative aspect-square rounded-lg border-2 transition-all p-1 flex flex-col hover:shadow-md",
                                    localSettings.primaryColor === theme.primaryColor &&
                                      localSettings.sidebarBackgroundColor === theme.sidebarBackgroundColor
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
                                  {localSettings.primaryColor === theme.primaryColor &&
                                    localSettings.sidebarBackgroundColor === theme.sidebarBackgroundColor && (
                                      <div className="absolute top-0.5 right-0.5 bg-primary text-white p-0.5 rounded-full shadow-lg">
                                        <Check className="h-2 w-2" />
                                      </div>
                                    )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    {searchQuery !== '' && PRESET_THEMES.filter(t =>
                      (activeCategory === 'All' || t.category === activeCategory) &&
                      t.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                        <div className="py-20 text-center">
                          <p className="text-xs text-gray-400 font-medium">No themes found matching "{searchQuery}"</p>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-[10px] text-primary font-bold uppercase hover:underline"
                          >
                            Clear Search
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            {/* Logo & Branding */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">Logo & Branding</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Organization Logo
                    </label>
                    <div className="flex items-center space-x-3">
                      {localSettings.logoUrl && (
                        <div className="w-14 h-14 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                          <img
                            src={localSettings.logoUrl}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        <div className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={localSettings.orgNameOverride || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, orgNameOverride: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                      placeholder="e.g. Acme Health"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Overrides the default database name</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Branding Colors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">Theme Colors</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <ColorInput label="Primary" field="primaryColor" description="Buttons & highlights" />
                <ColorInput label="Primary Text" field="primaryTextColor" description="Text on primary bg" />
                <ColorInput label="Sidebar Bg" field="sidebarBackgroundColor" description="Sidebar background" />
                <ColorInput label="Sidebar Text" field="sidebarTextColor" description="Inactive menu items" />
                <ColorInput label="Active Menu" field="sidebarActiveColor" description="Selected highlight" />
                <ColorInput label="Active Text" field="sidebarActiveTextColor" description="Text on active menu" />
                <ColorInput label="Secondary" field="secondaryColor" description="Secondary actions" />
                <ColorInput label="Accent" field="accentColor" description="Status indicators" />
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-gray-900">Typography</h2>
                </div>
                <select
                  value={localSettings.fontFamily}
                  onChange={(e) => setLocalSettings({ ...localSettings, fontFamily: e.target.value })}
                  className="w-48 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Inter, sans-serif">Inter (Default)</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview Column (Vertical Split) */}
          {showPreview && (
            <div className="lg:col-span-12 xl:col-span-5">
              <div className="xl:sticky xl:top-4 space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900">Live Preview</h2>
                    <span className="text-[10px] text-gray-400 font-mono">Real-time Visualization</span>
                  </div>

                  <div className="rounded-lg border border-gray-100 overflow-hidden shadow-inner flex flex-col md:flex-row min-h-[400px]">
                    {/* Sidebar Preview */}
                    <div
                      className="w-full md:w-1/3 p-4 flex flex-col"
                      style={{
                        backgroundColor: localSettings.sidebarBackgroundColor,
                        fontFamily: localSettings.fontFamily
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-6">
                        {localSettings.logoUrl ? (
                          <img src={localSettings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                          <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm" style={{ backgroundColor: localSettings.primaryColor }}>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: localSettings.primaryTextColor || (getContrastColor(localSettings.primaryColor) === 'white' ? '#FFFFFF' : '#000000') }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h2
                            className="text-[11px] font-bold truncate leading-tight"
                            style={{ color: localSettings.sidebarTextColor || (getContrastColor(localSettings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000') }}
                          >
                            {localSettings.orgNameOverride || 'EHR Connect'}
                          </h2>
                          <p className="text-[8px] font-medium opacity-60 truncate uppercase tracking-tighter" style={{ color: localSettings.sidebarTextColor || (getContrastColor(localSettings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000') }}>
                            Location Name
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {['Dashboard', 'Patients', 'Staff'].map((item, idx) => {
                          const isActive = idx === 0;
                          const activeBg = localSettings.sidebarActiveColor;
                          const activeText = localSettings.sidebarActiveTextColor || (getContrastColor(activeBg) === 'white' ? '#FFFFFF' : '#000000');
                          const inactiveText = localSettings.sidebarTextColor || (getContrastColor(localSettings.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000');

                          return (
                            <div
                              key={item}
                              className="px-2 py-1.5 rounded flex items-center space-x-2 shadow-sm transition-all"
                              style={{
                                backgroundColor: isActive ? activeBg : 'transparent',
                                color: isActive ? activeText : inactiveText
                              }}
                            >
                              <div className="w-1 h-1 rounded-full shadow-glow" style={{ backgroundColor: localSettings.accentColor }} />
                              <span className="text-[10px] font-medium">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content Area Preview */}
                    <div
                      className={cn(
                        "w-full md:w-2/3 p-6 flex flex-col items-center justify-center text-center space-y-4 transition-colors duration-300",
                        localSettings.sidebarBackgroundColor === '#000000' || localSettings.sidebarBackgroundColor === '#121212' || localSettings.sidebarBackgroundColor === '#0F172A' || localSettings.sidebarBackgroundColor === '#18181B'
                          ? "bg-[#1e1e1e] text-white"
                          : "bg-gray-50 text-gray-900"
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-1.5 text-[10px] font-bold rounded shadow-md transform hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: localSettings.primaryColor,
                              color: localSettings.primaryTextColor || (getContrastColor(localSettings.primaryColor) === 'white' ? '#FFFFFF' : '#000000')
                            }}
                          >
                            Primary
                          </button>
                          <button
                            className="px-4 py-1.5 text-[10px] font-bold text-white rounded shadow-md transform hover:scale-105 transition-transform"
                            style={{ backgroundColor: localSettings.secondaryColor }}
                          >
                            Secondary
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full animate-pulse shadow-glow" style={{ backgroundColor: localSettings.accentColor }} />
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-widest",
                            localSettings.sidebarBackgroundColor === '#000000' || localSettings.sidebarBackgroundColor === '#121212' || localSettings.sidebarBackgroundColor === '#0F172A' ? "text-gray-400" : "text-gray-400"
                          )}>Accent Active</span>
                        </div>
                      </div>
                      <p className={cn(
                        "text-[10px] max-w-[150px] leading-relaxed",
                        localSettings.sidebarBackgroundColor === '#000000' || localSettings.sidebarBackgroundColor === '#121212' || localSettings.sidebarBackgroundColor === '#0F172A' ? "text-gray-400" : "text-gray-500"
                      )}>
                        Experimental branding for {localSettings.orgNameOverride || 'the facility'}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
