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
  Clock
} from 'lucide-react';
import { countryService } from '@/services/country.service';
import { useCountryContext } from '@/contexts/country-context';
import type { CountryPack, CountryModule } from '@/types/country';

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Country-Specific Settings</h1>
        <p className="text-muted-foreground">
          Configure country-based features, modules, and localization for your organization
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="country" className="space-y-4">
        <TabsList>
          <TabsTrigger value="country">
            <Globe className="mr-2 h-4 w-4" />
            Country Selection
          </TabsTrigger>
          <TabsTrigger value="modules">
            <Settings className="mr-2 h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="current">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Current Settings
          </TabsTrigger>
        </TabsList>

        {/* Country Selection Tab */}
        <TabsContent value="country" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Country</CardTitle>
              <CardDescription>
                Choose the country where your organization operates. This will enable country-specific
                features, regulatory compliance, and localization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePacks.map((pack) => (
                      <SelectItem key={pack.country_code} value={pack.country_code}>
                        {pack.country_name} ({pack.country_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPack && (
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                  <div>
                    <h3 className="font-semibold">{selectedPack.country_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPack.region}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Regulatory Body</Label>
                      <p className="text-sm font-medium">{selectedPack.regulatory_body || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <p className="text-sm font-medium">{selectedPack.default_currency}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Timezone</Label>
                      <p className="text-sm font-medium">{selectedPack.default_timezone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Format</Label>
                      <p className="text-sm font-medium">{selectedPack.date_format}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedPack.hipaa_compliant && (
                      <Badge variant="secondary">
                        <Shield className="mr-1 h-3 w-3" />
                        HIPAA Compliant
                      </Badge>
                    )}
                    {selectedPack.gdpr_compliant && (
                      <Badge variant="secondary">
                        <Shield className="mr-1 h-3 w-3" />
                        GDPR Compliant
                      </Badge>
                    )}
                    {selectedPack.data_residency_required && (
                      <Badge variant="secondary">Data Residency Required</Badge>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveCountryPack}
                disabled={!selectedCountry || saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Enable Country Pack'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Country-Specific Modules</CardTitle>
              <CardDescription>
                Enable or disable modules for {selectedCountry || 'the selected country'}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-4">
                  {availableModules.map((module) => (
                    <div
                      key={module.module_code}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{module.module_name}</h4>
                          <Badge variant="outline">{module.module_type}</Badge>
                          {module.beta && <Badge variant="secondary">Beta</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        {module.required_integrations && module.required_integrations.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Requires: {module.required_integrations.join(', ')}
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={enabledModuleCodes.has(module.module_code)}
                        onCheckedChange={(checked) =>
                          handleToggleModule(module.module_code, checked)
                        }
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Settings Tab */}
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>
                Your organization's active country pack and enabled modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!countryPack ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No country pack is currently enabled. Please select a country to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Country Pack</h3>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="grid gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Country</Label>
                          <p className="font-semibold">{countryPack.countryName}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Currency</Label>
                            <p className="text-sm">{countryPack.modules.default_currency}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Language</Label>
                            <p className="text-sm">{countryPack.modules.default_language}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Timezone</Label>
                            <p className="text-sm">{countryPack.modules.default_timezone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Enabled Modules</h3>
                    {enabledModules.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          No modules are currently enabled. Enable modules in the Modules tab.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid gap-3">
                        {enabledModules.map((module) => (
                          <div
                            key={module.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{module.moduleName}</h4>
                                  <Badge
                                    variant={
                                      module.status === 'active' ? 'default' :
                                      module.status === 'error' ? 'destructive' :
                                      'secondary'
                                    }
                                  >
                                    {module.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
                                </p>
                                {module.lastSyncAt && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
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
  );
}
