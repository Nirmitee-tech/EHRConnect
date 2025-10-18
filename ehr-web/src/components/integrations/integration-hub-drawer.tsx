'use client';

import React, { useState } from 'react';
import { X, Plus, Settings, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import {
  IntegrationCategory,
  IntegrationVendor,
  IntegrationConfig,
  INTEGRATION_CATEGORIES,
  SAMPLE_VENDORS,
  IntegrationStatus
} from '@/types/integration';
import { IntegrationConfigForm } from './integration-config-form';

interface IntegrationHubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationHubDrawer({ isOpen, onClose }: IntegrationHubDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>('ehr');
  const [selectedVendor, setSelectedVendor] = useState<IntegrationVendor | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

  // Get vendors for selected category
  const categoryVendors = SAMPLE_VENDORS.filter(v => v.category === selectedCategory);

  // Get configured integrations for current category
  const configuredIntegrations = integrations.filter(
    int => SAMPLE_VENDORS.find(v => v.id === int.vendorId)?.category === selectedCategory
  );

  const handleVendorSelect = (vendor: IntegrationVendor) => {
    setSelectedVendor(vendor);
    setShowConfigForm(true);
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
    setShowConfigForm(false);
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
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integration Hub</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure and manage third-party integrations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4 space-y-1">
              {INTEGRATION_CATEGORIES.map((category) => {
                const categoryIntegrations = integrations.filter(
                  int => SAMPLE_VENDORS.find(v => v.id === int.vendorId)?.category === category.id
                );
                const activeCount = categoryIntegrations.filter(int => int.enabled).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowConfigForm(false);
                      setSelectedVendor(null);
                    }}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all
                      ${selectedCategory === category.id
                        ? 'bg-primary text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {category.name}
                        </div>
                        <div className={`text-xs truncate ${
                          selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {category.description}
                        </div>
                      </div>
                      {activeCount > 0 && (
                        <span className={`
                          text-xs font-bold px-2 py-0.5 rounded-full
                          ${selectedCategory === category.id
                            ? 'bg-white/20 text-white'
                            : 'bg-green-100 text-green-700'
                          }
                        `}>
                          {activeCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {showConfigForm && selectedVendor ? (
              <IntegrationConfigForm
                vendor={selectedVendor}
                existingConfig={integrations.find(int => int.vendorId === selectedVendor.id)}
                onSave={handleSaveConfig}
                onCancel={() => {
                  setShowConfigForm(false);
                  setSelectedVendor(null);
                }}
              />
            ) : (
              <div className="p-6">
                {/* Category Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {INTEGRATION_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {INTEGRATION_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>

                {/* Configured Integrations */}
                {configuredIntegrations.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Active Integrations
                    </h4>
                    <div className="space-y-3">
                      {configuredIntegrations.map((integration) => {
                        const vendor = SAMPLE_VENDORS.find(v => v.id === integration.vendorId);
                        if (!vendor) return null;

                        return (
                          <div
                            key={integration.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                  {INTEGRATION_CATEGORIES.find(c => c.id === vendor.category)?.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-gray-900">{vendor.name}</h5>
                                    {getStatusIcon(integration.healthStatus)}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{vendor.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      integration.environment === 'production'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {integration.environment}
                                    </span>
                                    {integration.lastTestedAt && (
                                      <span className="text-xs text-gray-400">
                                        Last tested: {new Date(integration.lastTestedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleVendorSelect(vendor)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Configure"
                                >
                                  <Settings className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleToggleIntegration(integration.id)}
                                  className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${integration.enabled ? 'bg-green-600' : 'bg-gray-300'}
                                  `}
                                >
                                  <span
                                    className={`
                                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                      ${integration.enabled ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Vendors */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Available Vendors
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryVendors
                      .filter(vendor => !integrations.find(int => int.vendorId === vendor.id))
                      .map((vendor) => (
                        <button
                          key={vendor.id}
                          onClick={() => handleVendorSelect(vendor)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-primary/10 transition-colors">
                              {INTEGRATION_CATEGORIES.find(c => c.id === vendor.category)?.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {vendor.name}
                              </h5>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {vendor.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3" />
                                <span className="text-xs font-medium">Configure</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Empty State */}
                {categoryVendors.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">
                      {INTEGRATION_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                    </div>
                    <p className="text-gray-500">No vendors available for this category yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
