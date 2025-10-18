'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  IntegrationVendor,
  IntegrationConfig
} from '@/types/integration';
import { IntegrationConfigForm } from './integration-config-form';

interface IntegrationConfigDrawerProps {
  vendor: IntegrationVendor;
  existingConfig?: IntegrationConfig;
  onSave: (config: IntegrationConfig) => void;
  onClose: () => void;
}

export function IntegrationConfigDrawer({
  vendor,
  existingConfig,
  onSave,
  onClose
}: IntegrationConfigDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-250 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {existingConfig ? 'Update Integration' : 'Configure Integration'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {vendor.name}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <IntegrationConfigForm
            vendor={vendor}
            existingConfig={existingConfig}
            onSave={onSave}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
