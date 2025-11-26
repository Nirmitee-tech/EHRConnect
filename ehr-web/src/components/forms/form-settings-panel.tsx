'use client';

import React from 'react';
import { Settings, Palette, Layout, Eye, Code } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FormSettings } from '@/types/forms';

interface FormSettingsPanelProps {
  settings: FormSettings;
  onChange: (settings: FormSettings) => void;
}

const DEFAULT_SETTINGS: FormSettings = {
  layout: 'standard',
  displayMode: 'single-page',
  allowAnonymous: false,
  showProgressBar: true,
  showQuestionNumbers: false,
  autoSave: true,
  autoSaveInterval: 30,
  allowSaveDraft: true,
  requireAllQuestions: false,
  shuffleQuestions: false,
  showValidationOnBlur: true,
};

export function FormSettingsPanel({ settings = DEFAULT_SETTINGS, onChange }: FormSettingsPanelProps) {
  const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const updateBranding = <K extends keyof NonNullable<FormSettings['branding']>>(
    key: K,
    value: NonNullable<FormSettings['branding']>[K]
  ) => {
    onChange({
      ...settings,
      branding: { ...settings.branding, [key]: value },
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Form Settings</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Layout Style</Label>
              <Select
                value={settings.layout}
                onValueChange={(value) => updateSetting('layout', value as FormSettings['layout'])}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact - Minimal spacing</SelectItem>
                  <SelectItem value="standard">Standard - Balanced layout</SelectItem>
                  <SelectItem value="wizard">Wizard - Step by step</SelectItem>
                  <SelectItem value="card">Card - Each question in a card</SelectItem>
                  <SelectItem value="accordion">Accordion - Expandable sections</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {settings.layout === 'compact' && 'Tight spacing, ideal for mobile'}
                {settings.layout === 'standard' && 'Comfortable spacing for desktop'}
                {settings.layout === 'wizard' && 'Guided flow, one section at a time'}
                {settings.layout === 'card' && 'Cards with shadows and spacing'}
                {settings.layout === 'accordion' && 'Collapsible sections'}
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block">Display Mode</Label>
              <Select
                value={settings.displayMode}
                onValueChange={(value) => updateSetting('displayMode', value as FormSettings['displayMode'])}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-page">Single Page - All questions</SelectItem>
                  <SelectItem value="paginated">Paginated - Multiple pages</SelectItem>
                  <SelectItem value="section-by-section">Section by Section</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Show Progress Bar</Label>
                <p className="text-xs text-gray-500">Display completion progress</p>
              </div>
              <Switch
                checked={settings.showProgressBar}
                onCheckedChange={(checked) => updateSetting('showProgressBar', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Show Question Numbers</Label>
                <p className="text-xs text-gray-500">Number each question (1, 2, 3...)</p>
              </div>
              <Switch
                checked={settings.showQuestionNumbers}
                onCheckedChange={(checked) => updateSetting('showQuestionNumbers', checked)}
              />
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Allow Anonymous Access</Label>
                <p className="text-xs text-gray-500">Anyone can fill without login</p>
              </div>
              <Switch
                checked={settings.allowAnonymous}
                onCheckedChange={(checked) => updateSetting('allowAnonymous', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Auto-Save</Label>
                <p className="text-xs text-gray-500">Automatically save progress</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            {settings.autoSave && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Auto-Save Interval (seconds)</Label>
                <Input
                  type="number"
                  min="10"
                  max="300"
                  value={settings.autoSaveInterval || 30}
                  onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Allow Save Draft</Label>
                <p className="text-xs text-gray-500">Users can save and return later</p>
              </div>
              <Switch
                checked={settings.allowSaveDraft}
                onCheckedChange={(checked) => updateSetting('allowSaveDraft', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Require All Questions</Label>
                <p className="text-xs text-gray-500">Override individual required flags</p>
              </div>
              <Switch
                checked={settings.requireAllQuestions}
                onCheckedChange={(checked) => updateSetting('requireAllQuestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Shuffle Questions</Label>
                <p className="text-xs text-gray-500">Randomize question order</p>
              </div>
              <Switch
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) => updateSetting('shuffleQuestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Validate on Blur</Label>
                <p className="text-xs text-gray-500">Show errors when field loses focus</p>
              </div>
              <Switch
                checked={settings.showValidationOnBlur}
                onCheckedChange={(checked) => updateSetting('showValidationOnBlur', checked)}
              />
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={settings.branding?.logoUrl || ''}
                onChange={(e) => updateBranding('logoUrl', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block">Header Text</Label>
              <Input
                placeholder="Welcome to our form"
                value={settings.branding?.headerText || ''}
                onChange={(e) => updateBranding('headerText', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block">Footer Text</Label>
              <Textarea
                placeholder="© 2024 Your Organization. All rights reserved."
                value={settings.branding?.footerText || ''}
                onChange={(e) => updateBranding('footerText', e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.branding?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="h-8 w-12 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.branding?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="h-8 text-xs flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium mb-1.5 block">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.branding?.accentColor || '#10B981'}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="h-8 w-12 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.branding?.accentColor || '#10B981'}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="h-8 text-xs flex-1"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Custom CSS</Label>
              <Textarea
                placeholder=".form-question { margin-bottom: 20px; }"
                value={settings.customCss || ''}
                onChange={(e) => updateSetting('customCss', e.target.value)}
                rows={10}
                className="text-xs font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add custom CSS to style your form. Use with caution.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
