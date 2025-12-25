'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';

export default function PayersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/settings/billing" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Billing Settings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insurance Payers</h1>
              <p className="text-sm text-gray-600 mt-1">Medicare, Medicaid, and commercial insurance networks</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Payer
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insurance Payers Management</h3>
          <p className="text-gray-600">Configure insurance payers, ERA/EDI settings, and timely filing limits</p>
        </div>
      </div>
    </div>
  );
}
