'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  IntegrationVendor,
  IntegrationConfig
} from '@/types/integration';
import { IntegrationConfigForm } from './integration-config-form';

interface IntegrationConfigModalProps {
  vendor: IntegrationVendor;
  existingConfig?: IntegrationConfig;
  onSave: (config: IntegrationConfig) => void;
  onClose: () => void;
}

export function IntegrationConfigModal({
  vendor,
  existingConfig,
  onSave,
  onClose
}: IntegrationConfigModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${
          isVisible
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Header with gradient matching the main page */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />

          <div className="relative px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {existingConfig ? 'Update Integration' : 'Add New Integration'}
              </h2>
              <p className="text-sm text-white/80">
                {existingConfig
                  ? 'Modify your integration settings and credentials'
                  : 'Connect and configure your integration in a few steps'
                }
              </p>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all duration-200 group"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
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
