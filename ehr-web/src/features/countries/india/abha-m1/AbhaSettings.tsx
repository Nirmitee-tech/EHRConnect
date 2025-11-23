'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import type { CountryModuleSettingsProps } from '@/types/country';

/**
 * ABHA M1 Settings Component
 * Configure ABDM API credentials and settings
 */
export default function AbhaSettings({
  orgId,
  moduleCode,
  currentConfig,
  onSave,
  onCancel
}: CountryModuleSettingsProps) {
  const [config, setConfig] = useState({
    api_endpoint: currentConfig.api_endpoint || 'https://healthidsbx.abdm.gov.in',
    client_id: currentConfig.client_id || '',
    client_secret: currentConfig.client_secret || '',
    mode: currentConfig.mode || 'sandbox'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validate
    if (!config.client_id || !config.client_secret) {
      setError('Client ID and Client Secret are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ABHA M1 Settings</h2>
        <p className="text-muted-foreground">
          Configure ABDM API credentials for ABHA number generation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Enter your ABDM API credentials. Get them from{' '}
            <a
              href="https://sandbox.abdm.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ABDM Sandbox
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Environment Mode</Label>
            <Select
              value={config.mode}
              onValueChange={(value) => setConfig({ ...config, mode: value })}
            >
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Use sandbox mode for testing with test data
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_endpoint">API Endpoint</Label>
            <Input
              id="api_endpoint"
              type="url"
              value={config.api_endpoint}
              onChange={(e) => setConfig({ ...config, api_endpoint: e.target.value })}
              placeholder="https://healthidsbx.abdm.gov.in"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID</Label>
            <Input
              id="client_id"
              type="text"
              value={config.client_id}
              onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
              placeholder="Enter your ABDM Client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_secret">Client Secret</Label>
            <Input
              id="client_secret"
              type="password"
              value={config.client_secret}
              onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
              placeholder="Enter your ABDM Client Secret"
            />
            <p className="text-sm text-muted-foreground">
              Client secret will be encrypted and stored securely
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !config.client_id || !config.client_secret}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Important:</strong> Make sure you have registered your application with ABDM
          and obtained valid credentials. For production use, you'll need to complete the ABDM
          certification process.
        </AlertDescription>
      </Alert>
    </div>
  );
}
