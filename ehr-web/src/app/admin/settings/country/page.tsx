'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  Settings,
  Shield,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Languages
} from 'lucide-react';
import { countryService } from '@/services/country.service';
import { useCountryContext } from '@/contexts/country-context';
import type { CountryPack, CountryModule } from '@/types/country';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function CountrySettingsPage() {
  const { data: session } = useSession();
  const { countryPack, enabledModules, refreshContext } = useCountryContext();

  const [availablePacks, setAvailablePacks] = useState<CountryPack[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<CountryPack | null>(null);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [enabledModuleCodes, setEnabledModuleCodes] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const headers = {
    'x-org-id': session?.org_id || '',
    'x-user-id': session?.user?.id || '',
    'x-user-roles': JSON.stringify(session?.roles || [])
  };

  useEffect(() => {
    loadCountryPacks();
    if (countryPack) {
      setSelectedCountry(countryPack.countryCode);
      setEnabledModuleCodes(new Set(enabledModules.map(m => m.moduleCode)));
    }
  }, []);

  const loadCountryPacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const packs = await countryService.getAllCountryPacks(headers);
      setAvailablePacks(packs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load country packs');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    setError(null);

    try {
      const pack = await countryService.getCountryPack(countryCode, headers);
      setSelectedPack(pack);

      const modules = await countryService.getCountryModules(countryCode, headers);
      setAvailableModules(modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load country details');
    }
  };

  const handleSaveCountryPack = async () => {
    if (!selectedCountry || !session?.org_id) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await countryService.enableCountryPack(
        session.org_id,
        selectedCountry,
        headers
      );

      if (result.success) {
        setSuccess(`Country pack enabled: ${selectedCountry}`);
        await refreshContext();
      } else {
        setError(result.error || 'Failed to enable country pack');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save country pack');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModule = async (moduleCode: string, enabled: boolean) => {
    if (!session?.org_id || !selectedCountry) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (enabled) {
        const result = await countryService.enableModules(
          session.org_id,
          [{ countryCode: selectedCountry, moduleCode, config: {} }],
          headers
        );

        if (result.success) {
          setEnabledModuleCodes(prev => new Set([...prev, moduleCode]));
          setSuccess(`Module enabled: ${moduleCode}`);
          await refreshContext();
        } else {
          setError(result.error || 'Failed to enable module');
        }
      } else {
        const result = await countryService.disableModules(
          session.org_id,
          [{ moduleCode }],
          headers
        );

        if (result.success) {
          setEnabledModuleCodes(prev => {
            const newSet = new Set(prev);
            newSet.delete(moduleCode);
            return newSet;
          });
          setSuccess(`Module disabled: ${moduleCode}`);
          await refreshContext();
        } else {
          setError(result.error || 'Failed to disable module');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle module');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading country configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Country Configuration</h1>
              <p className="text-sm text-gray-600">
                Configure country-based features, modules, and localization for your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="country" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="country" className="gap-2">
              <Globe className="h-4 w-4" />
              Country Selection
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Settings className="h-4 w-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="current" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Current Settings
            </TabsTrigger>
          </TabsList>

          {/* Country Selection Tab */}
          <TabsContent value="country" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Select Country
                </CardTitle>
                <CardDescription>
                  Choose the country where your organization operates to enable country-specific features, regulatory compliance, and localization.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePacks.map((pack) => (
                        <SelectItem key={pack.countryCode} value={pack.countryCode}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pack.countryName}</span>
                            <span className="text-gray-500">({pack.countryCode})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPack && (
                  <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedPack.countryName}</h3>
                      <p className="text-sm text-gray-600">{selectedPack.region}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                          <Globe className="h-3 w-3" />
                          Country Code
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedPack.countryCode}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Pack Version
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedPack.packVersion}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                          <MapPin className="h-3 w-3" />
                          Region
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedPack.region}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                          <Settings className="h-3 w-3" />
                          Pack Slug
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedPack.packSlug}</p>
                      </div>
                    </div>

                    {selectedPack.regulatoryBody && (
                      <div className="pt-4 border-t border-gray-200">
                        <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Regulatory Body</Label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{selectedPack.regulatoryBody}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedPack.hipaaCompliant && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          <Shield className="mr-1 h-3 w-3" />
                          HIPAA Compliant
                        </Badge>
                      )}
                      {selectedPack.gdprCompliant && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          <Shield className="mr-1 h-3 w-3" />
                          GDPR Compliant
                        </Badge>
                      )}
                      {selectedPack.dataResidencyRequired && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                          Data Residency Required
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSaveCountryPack}
                  disabled={!selectedCountry || saving}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enabling Country Pack...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Enable Country Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Country-Specific Modules
                </CardTitle>
                <CardDescription>
                  Enable or disable modules for {selectedCountry ? `${selectedPack?.countryName}` : 'the selected country'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!selectedCountry ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a country first to view available modules
                    </AlertDescription>
                  </Alert>
                ) : availableModules.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No modules available for {selectedCountry}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {availableModules.map((module) => (
                      <div
                        key={module.module_code}
                        className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-900">{module.module_name}</h4>
                            <Badge variant="outline" className="text-xs">{module.module_type}</Badge>
                            {module.beta && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Beta</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          {module.required_integrations && module.required_integrations.length > 0 && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Requires:</span> {module.required_integrations.join(', ')}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={enabledModuleCodes.has(module.module_code)}
                          onCheckedChange={(checked) =>
                            handleToggleModule(module.module_code, checked)
                          }
                          disabled={saving}
                          className="ml-4"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Settings Tab */}
          <TabsContent value="current" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Current Configuration
                </CardTitle>
                <CardDescription>
                  Your organization's active country pack and enabled modules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!countryPack ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No country pack is currently enabled. Please select a country in the Country Selection tab to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Active Country Pack
                      </h3>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <div className="grid gap-6">
                          <div>
                            <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Country</Label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{countryPack.countryName}</p>
                          </div>
                          {/* Localization info - requires separate Localization API call */}
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Country Code</Label>
                              <p className="text-sm font-medium text-gray-900 mt-1">{countryPack.countryCode}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pack Version</Label>
                              <p className="text-sm font-medium text-gray-900 mt-1">{countryPack.packVersion}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Region</Label>
                              <p className="text-sm font-medium text-gray-900 mt-1">{countryPack.region}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Enabled Modules
                        <Badge variant="secondary" className="ml-2">{enabledModules.length}</Badge>
                      </h3>
                      {enabledModules.length === 0 ? (
                        <Alert>
                          <AlertDescription>
                            No modules are currently enabled. Enable modules in the Modules tab.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid gap-4">
                          {enabledModules.map((module) => (
                            <div
                              key={module.id}
                              className="rounded-lg border border-gray-200 bg-white p-5"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-gray-900">{module.moduleName}</h4>
                                    <Badge
                                      variant={
                                        module.status === 'active' ? 'default' :
                                        module.status === 'error' ? 'destructive' :
                                        'secondary'
                                      }
                                      className={
                                        module.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''
                                      }
                                    >
                                      {module.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {module.description}
                                  </p>
                                  {module.lastSyncAt && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Last synced: {new Date(module.lastSyncAt).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
