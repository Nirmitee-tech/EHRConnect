'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { TemplateService } from '@/services/template.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function TemplateAdminPage() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitializeTemplates = async () => {
    setInitializing(true);
    setError(null);
    setSuccess(false);

    try {
      await TemplateService.initializeDefaultTemplates();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize templates');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Template Administration</h1>
          <p className="text-gray-600 mt-1">Manage clinical note templates for the EHR system</p>
        </div>

        {/* Initialize Default Templates Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Initialize Default Templates</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will create a set of default templates for Chief Complaints, Findings, Investigations,
            Diagnoses, Clinical Notes, and Instructions. These templates are stored as FHIR Questionnaire resources.
          </p>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Default templates include:</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Chief Complaints (4 templates)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Findings (3 templates)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Investigations (2 templates)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Diagnoses (3 templates)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                Clinical Notes (2 templates)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Instructions (2 templates)
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">Templates initialized successfully!</p>
            </div>
          )}

          <button
            onClick={handleInitializeTemplates}
            disabled={initializing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {initializing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Initializing Templates...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Initialize Default Templates
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Note: Running this multiple times will create duplicate templates. Only run once per system setup.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Template System Features</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Template Selection</p>
                <p>Quick access to frequently used templates through dropdown selectors</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Popular Templates</p>
                <p>Templates are ranked by usage count, showing most frequently used first</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">Custom Templates</p>
                <p>Doctors can save their own templates from the clinical note form</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-medium text-gray-900">FHIR-Compliant Storage</p>
                <p>All templates are stored as FHIR Questionnaire resources for interoperability</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <div>
                <p className="font-medium text-gray-900">Search & Filter</p>
                <p>Find templates quickly by name, content, or tags</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
