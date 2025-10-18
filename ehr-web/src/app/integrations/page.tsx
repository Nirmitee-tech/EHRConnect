'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Loader,
  ExternalLink
} from 'lucide-react';
import {
  IntegrationCategory,
  IntegrationVendor,
  IntegrationConfig,
  INTEGRATION_CATEGORIES,
  SAMPLE_VENDORS,
  IntegrationStatus
} from '@/types/integration';
import { IntegrationConfigDrawer } from '@/components/integrations/integration-config-drawer';
import { IntegrationLogo } from '@/components/integrations/integration-logo';

type TabCategory = 'all' | 'clinical' | 'financial' | 'operations' | 'technology';

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [selectedTab, setSelectedTab] = useState<TabCategory>('all');
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<IntegrationVendor | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Filter vendors based on search, category, and tab
  const filteredVendors = useMemo(() => {
    return SAMPLE_VENDORS.filter(vendor => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;

      // Tab filtering by business area
      let matchesTab = true;
      if (selectedTab === 'clinical') {
        matchesTab = ['ehr', 'hl7-fhir', 'laboratory', 'pharmacy', 'imaging', 'telehealth'].includes(vendor.category);
      } else if (selectedTab === 'financial') {
        matchesTab = ['rcm', 'billing', 'claims', 'eligibility', 'payment', 'era'].includes(vendor.category);
      } else if (selectedTab === 'operations') {
        matchesTab = ['inventory', 'erp', 'crm', 'communication', 'analytics'].includes(vendor.category);
      } else if (selectedTab === 'technology') {
        matchesTab = ['ai', 'custom'].includes(vendor.category);
      }

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [searchQuery, selectedCategory, selectedTab]);

  // Get configured integrations
  const configuredVendorIds = integrations.map(int => int.vendorId);
  const activeIntegrationsCount = integrations.filter(int => int.enabled).length;

  const handleConfigure = (vendor: IntegrationVendor) => {
    setSelectedVendor(vendor);
    setShowConfigModal(true);
  };

  const handleSaveConfig = (config: IntegrationConfig) => {
    setIntegrations(prev => {
      const existingIndex = prev.findIndex(int => int.id === config.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      }
      return [...prev, config];
    });
    setShowConfigModal(false);
    setSelectedVendor(null);
  };

  const handleToggleIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? { ...int, enabled: !int.enabled }
        : int
    ));
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIntegrationConfig = (vendorId: string) => {
    return integrations.find(int => int.vendorId === vendorId);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Simplified Header */}
      <div className="border-b border-gray-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Connections Library
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Build your unified EHR stack with one-click apps & integrations
              </h1>
              <p className="text-base text-gray-600 max-w-3xl">
                Connect with EHR systems, clearinghouses, AI tools, and telehealth platforms. Configure integrations in minutes with our self-service portal.
              </p>
            </div>
            {activeIntegrationsCount > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{activeIntegrationsCount}</span> active
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as IntegrationCategory | 'all')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
            >
              <option value="all">All</option>
              {INTEGRATION_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'all'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedTab('clinical')}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'clinical'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Clinical
          </button>
          <button
            onClick={() => setSelectedTab('financial')}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'financial'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Financial
          </button>
          <button
            onClick={() => setSelectedTab('operations')}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'operations'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setSelectedTab('technology')}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'technology'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Technology
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Active Integrations Section */}
          {integrations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Your Active Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {integrations.map((integration) => {
                  const vendor = SAMPLE_VENDORS.find(v => v.id === integration.vendorId);
                  if (!vendor) return null;

                  const categoryInfo = INTEGRATION_CATEGORIES.find(c => c.id === vendor.category);

                  return (
                    <button
                      key={integration.id}
                      onClick={() => handleConfigure(vendor)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all text-left group relative"
                    >
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        {getStatusIcon(integration.healthStatus)}
                      </div>

                      <div className="flex items-start gap-3 mb-3">
                        <IntegrationLogo
                          name={vendor.name}
                          logo={vendor.logo}
                          category={vendor.category}
                          className="w-14 h-14 rounded-lg flex-shrink-0 text-sm"
                        />
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className="font-medium text-gray-900 text-sm truncate mb-0.5">
                            {vendor.name}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {vendor.category.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem]">
                        {vendor.description}
                      </p>

                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          integration.environment === 'production'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {integration.environment}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Integrations - Flat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredVendors.map((vendor) => {
                const categoryInfo = INTEGRATION_CATEGORIES.find(c => c.id === vendor.category);
                const integration = getIntegrationConfig(vendor.id);
                const isConfigured = !!integration;

                return (
                  <button
                    key={vendor.id}
                    onClick={() => handleConfigure(vendor)}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all text-left group relative ${
                      isConfigured && integration.enabled
                        ? 'border-green-200 hover:border-green-300'
                        : isConfigured
                        ? 'border-gray-300 hover:border-gray-400'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Status indicator */}
                    {isConfigured && (
                      <div className="absolute top-3 right-3">
                        <div className={`w-2 h-2 rounded-full ${
                          integration.enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <IntegrationLogo
                        name={vendor.name}
                        logo={vendor.logo}
                        category={vendor.category}
                        className="w-14 h-14 rounded-lg flex-shrink-0 text-sm"
                      />
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium text-gray-900 text-sm truncate mb-0.5">
                          {vendor.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {vendor.category.replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {vendor.description}
                    </p>

                    {/* Documentation/Website link */}
                    {(vendor.documentation || vendor.website) && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">
                          {vendor.documentation ? 'View Docs' : 'Learn More'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      {isConfigured ? (
                        <span className={`text-xs font-medium ${
                          integration.enabled ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {integration.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Not configured</span>
                      )}

                      <div className="flex items-center gap-1 text-xs text-gray-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{isConfigured ? 'Edit' : 'Configure'}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })
            }
          </div>

          {/* Empty State */}
          {filteredVendors.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No integrations found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Drawer */}
      {showConfigModal && selectedVendor && (
        <IntegrationConfigDrawer
          vendor={selectedVendor}
          existingConfig={getIntegrationConfig(selectedVendor.id)}
          onSave={handleSaveConfig}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
}
