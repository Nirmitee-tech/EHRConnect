'use client';

import React, { useState } from 'react';
import { useTheme, defaultTheme } from '@/contexts/theme-context';
import { ArrowLeft, Palette, Save, RotateCcw, Upload, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AppearancePage() {
  const { themeSettings, updateTheme, resetTheme, isLoading, error } = useTheme();
  const [localSettings, setLocalSettings] = useState(themeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local settings when theme changes
  React.useEffect(() => {
    setLocalSettings(themeSettings);
  }, [themeSettings]);

  const handleColorChange = (field: keyof typeof localSettings, value: string) => {
    setLocalSettings({ ...localSettings, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateTheme(localSettings);
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
    field: keyof typeof localSettings; 
    description: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={localSettings[field] as string}
          onChange={(e) => handleColorChange(field, e.target.value)}
          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={localSettings[field] as string}
          onChange={(e) => handleColorChange(field, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#4A90E2"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/settings" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Appearance Settings</h1>
                <p className="text-sm text-gray-500">Customize your organization's theme and branding</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </button>
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">Theme settings saved successfully!</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Logo & Branding</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {localSettings.logoUrl && (
                      <div className="w-24 h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                        <img 
                          src={localSettings.logoUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 200x200px, PNG or SVG format
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Colors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Primary Colors</h2>
              </div>
              <div className="space-y-4">
                <ColorInput
                  label="Primary Color"
                  field="primaryColor"
                  description="Main brand color used for buttons and highlights"
                />
                <ColorInput
                  label="Secondary Color"
                  field="secondaryColor"
                  description="Complementary color for secondary actions"
                />
                <ColorInput
                  label="Accent Color"
                  field="accentColor"
                  description="Accent color for status indicators and badges"
                />
              </div>
            </div>

            {/* Sidebar Colors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Sidebar Theme</h2>
              </div>
              <div className="space-y-4">
                <ColorInput
                  label="Sidebar Background"
                  field="sidebarBackgroundColor"
                  description="Background color for the navigation sidebar"
                />
                <ColorInput
                  label="Sidebar Text Color"
                  field="sidebarTextColor"
                  description="Text color for sidebar menu items"
                />
                <ColorInput
                  label="Active Item Color"
                  field="sidebarActiveColor"
                  description="Background color for active/selected menu items"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Typography</h2>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Font Family</label>
                <select
                  value={localSettings.fontFamily}
                  onChange={(e) => setLocalSettings({ ...localSettings, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
                
                {/* Sidebar Preview */}
                <div 
                  className="rounded-lg overflow-hidden border border-gray-200"
                  style={{ fontFamily: localSettings.fontFamily }}
                >
                  <div 
                    className="p-4"
                    style={{ backgroundColor: localSettings.sidebarBackgroundColor }}
                  >
                    {/* Logo Area */}
                    <div className="flex items-center space-x-2 mb-6">
                      {localSettings.logoUrl ? (
                        <img 
                          src={localSettings.logoUrl} 
                          alt="Logo" 
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: localSettings.primaryColor }}
                        >
                          <div className="w-4 h-4 bg-white rounded" />
                        </div>
                      )}
                      <div>
                        <h2 
                          className="text-base font-bold"
                          style={{ color: '#ffffff' }}
                        >
                          EHR Connect
                        </h2>
                        <p 
                          className="text-[9px] font-medium tracking-wide"
                          style={{ color: localSettings.sidebarTextColor }}
                        >
                          HEALTHCARE SYSTEM
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {['Dashboard', 'Patients', 'Appointments', 'Reports'].map((item, idx) => (
                        <div
                          key={item}
                          className="px-3 py-2 rounded-lg flex items-center space-x-2"
                          style={{
                            backgroundColor: idx === 0 ? localSettings.sidebarActiveColor : 'transparent',
                            color: '#ffffff'
                          }}
                        >
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: localSettings.accentColor }}
                          />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Area Preview */}
                  <div className="p-6 bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <button
                          className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                          style={{ backgroundColor: localSettings.primaryColor }}
                        >
                          Primary Button
                        </button>
                        <button
                          className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                          style={{ backgroundColor: localSettings.secondaryColor }}
                        >
                          Secondary Button
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: localSettings.accentColor }}
                        />
                        <span className="text-sm text-gray-600">Accent Color</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  This preview shows how your theme will appear across the application.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
