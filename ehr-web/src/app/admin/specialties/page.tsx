'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Check, X, RefreshCw, History, Database, Settings, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { specialtyService } from '@/services/specialty.service';
import type { PackSetting, PackAudit } from '@/types/specialty';

export default function SpecialtiesAdminPage() {
  const { data: session } = useSession();
  const [packs, setPacks] = useState<PackSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<PackAudit[]>([]);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available packs (hardcoded for now - in production, fetch from registry)
  const availablePacks = [
    { slug: 'general', version: '1.0.0', name: 'General Primary Care', description: 'Default specialty pack for general primary care practice' },
    { slug: 'ob-gyn', version: '1.0.0', name: 'OB/GYN & Prenatal', description: 'Obstetrics, gynecology, prenatal care, and postpartum workflows' },
    { slug: 'orthopedics', version: '1.0.0', name: 'Orthopedics', description: 'Orthopedic surgery, trauma, and rehabilitation' },
    { slug: 'wound-care', version: '1.0.0', name: 'Wound Care', description: 'Wound assessment, management, and healing tracking' }
  ];

  useEffect(() => {
    if (session?.org_id) {
      loadPacks();
      loadCacheStats();
    } else if (session) {
      // Session exists but no org_id - stop loading
      setLoading(false);
    }
  }, [session]);

  const loadPacks = async () => {
    try {
      setLoading(true);
      console.log('Loading packs for org:', session?.org_id);
      const data = await specialtyService.getOrgSpecialties(session, session?.org_id || '');
      console.log('Loaded packs:', data);
      setPacks(data);
    } catch (error) {
      console.error('Error loading packs:', error);
      showMessage('error', `Failed to load specialty packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCacheStats = async () => {
    try {
      const stats = await specialtyService.getCacheStats(session);
      setCacheStats(stats.cache);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const loadAuditHistory = async (packSlug?: string) => {
    try {
      const history = await specialtyService.getAuditHistory(session, session?.org_id || '', packSlug);
      setAuditHistory(history);
      setShowAuditHistory(true);
    } catch (error) {
      console.error('Error loading audit history:', error);
      showMessage('error', 'Failed to load audit history');
    }
  };

  const handleEnablePack = async (slug: string, version: string) => {
    try {
      setActionLoading(slug);
      await specialtyService.updateOrgSpecialties(
        session,
        session?.org_id || '',
        [{ slug, version, scope: 'org', scopeRefId: null }],
        []
      );
      showMessage('success', `Pack "${slug}" enabled successfully`);
      await loadPacks();
    } catch (error: any) {
      console.error('Error enabling pack:', error);
      showMessage('error', error.message || 'Failed to enable pack');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisablePack = async (slug: string) => {
    if (!confirm(`Are you sure you want to disable the "${slug}" pack?`)) {
      return;
    }

    try {
      setActionLoading(slug);
      await specialtyService.updateOrgSpecialties(
        session,
        session?.org_id || '',
        [],
        [{ slug, scope: 'org', scopeRefId: null }]
      );
      showMessage('success', `Pack "${slug}" disabled successfully`);
      await loadPacks();
    } catch (error: any) {
      console.error('Error disabling pack:', error);
      showMessage('error', error.message || 'Failed to disable pack');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReloadPack = async (slug: string, version: string) => {
    try {
      setActionLoading(`reload-${slug}`);
      await specialtyService.reloadPack(session, slug, version);
      showMessage('success', `Pack "${slug}" reloaded successfully`);
      await loadCacheStats();
    } catch (error: any) {
      console.error('Error reloading pack:', error);
      showMessage('error', error.message || 'Failed to reload pack');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all pack cache?')) {
      return;
    }

    try {
      setActionLoading('clear-cache');
      await specialtyService.clearCache(session);
      showMessage('success', 'Cache cleared successfully');
      await loadCacheStats();
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      showMessage('error', error.message || 'Failed to clear cache');
    } finally {
      setActionLoading(null);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const isPackEnabled = (slug: string) => {
    return packs.some(p => p.pack_slug === slug && p.enabled);
  };

  // Debug logging
  console.log('Session:', session);
  console.log('Loading:', loading);
  console.log('Packs:', packs);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No session found. Please log in.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading specialty packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                Specialty Pack Management
              </h1>
              <p className="text-gray-600 mt-2">
                Configure specialty-specific workflows, templates, and visit types for your organization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadAuditHistory()}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                View History
              </button>
              <button
                onClick={handleClearCache}
                disabled={actionLoading === 'clear-cache'}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                {actionLoading === 'clear-cache' ? 'Clearing...' : 'Clear Cache'}
              </button>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Cache Stats */}
        {cacheStats && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Cache Status:</span>
                <span className="text-gray-600">{cacheStats.size} packs cached</span>
              </div>
              {cacheStats.size > 0 && (
                <div className="text-xs text-gray-500">
                  {cacheStats.keys.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePacks.map((pack) => {
            const enabled = isPackEnabled(pack.slug);
            const packSetting = packs.find(p => p.pack_slug === pack.slug);
            const isLoading = actionLoading === pack.slug || actionLoading === `reload-${pack.slug}`;

            return (
              <div
                key={pack.slug}
                className={`bg-white rounded-lg border-2 transition-all ${
                  enabled
                    ? 'border-green-300 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${selectedPack === pack.slug ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="p-6">
                  {/* Pack Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                        {enabled && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Enabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{pack.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-mono">{pack.slug}</span>
                        <span className="mx-2">•</span>
                        <span>v{pack.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pack Details (if enabled) */}
                  {enabled && packSetting && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scope:</span>
                        <span className="font-medium text-gray-900">{packSetting.scope}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium text-gray-900">{packSetting.pack_version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(packSetting.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <>
                        <button
                          onClick={() => handleDisablePack(pack.slug)}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Disable
                        </button>
                        <button
                          onClick={() => handleReloadPack(pack.slug, pack.version)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                          title="Reload pack"
                        >
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => loadAuditHistory(pack.slug)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          title="View history"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnablePack(pack.slug, pack.version)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Enable Pack
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit History Modal */}
        {showAuditHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit History
                </h2>
                <button
                  onClick={() => setShowAuditHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {auditHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No audit history found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditHistory.map((audit) => (
                      <div
                        key={audit.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              audit.action === 'enabled'
                                ? 'bg-green-100 text-green-700'
                                : audit.action === 'disabled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {audit.action}
                            </span>
                            <span className="font-medium text-gray-900">{audit.pack_slug}</span>
                            <span className="text-xs text-gray-500">v{audit.pack_version}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(audit.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>By: {audit.actor_name || 'Unknown'}</span>
                          {audit.scope && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Scope: {audit.scope}</span>
                            </>
                          )}
                        </div>
                        {audit.metadata && Object.keys(audit.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                            {JSON.stringify(audit.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
