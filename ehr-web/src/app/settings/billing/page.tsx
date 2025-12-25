'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Circle, Loader2, BookOpen, DollarSign, Users,
  FileText, CreditCard, Settings as SettingsIcon, Building2, Wallet,
  TrendingUp, AlertCircle, ChevronRight, BarChart3
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { BillingMastersService, ValidationResult } from '@/services/billing-masters.service';

export default function BillingSettingsHub() {
  const { currentFacility } = useFacility();
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const hasOrgHeader = Boolean(headers['x-org-id']);
  const resolvedOrgId = headers['x-org-id'] || currentFacility?.id || null;

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadValidation();
    }
  }, [resolvedOrgId, hasOrgHeader]);

  const loadValidation = async () => {
    if (!resolvedOrgId || !hasOrgHeader) return;

    try {
      setLoading(true);
      const [validationData, progressData] = await Promise.all([
        BillingMastersService.validateMasterData(resolvedOrgId, headers),
        BillingMastersService.getSetupProgress(resolvedOrgId, headers)
      ]);
      setValidation(validationData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'chart-of-accounts',
      title: 'Chart of Accounts',
      description: 'Accounting structure with assets, liabilities, revenue & expenses',
      icon: BookOpen,
      href: '/settings/billing/chart-of-accounts',
      validation: validation?.chartOfAccounts,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'cost-centers',
      title: 'Cost Centers',
      description: 'Department-level budgeting and cost allocation',
      icon: BarChart3,
      href: '/settings/billing/cost-centers',
      validation: validation?.costCenters,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'bank-accounts',
      title: 'Bank Accounts',
      description: 'Payment collection accounts and GL mappings',
      icon: Wallet,
      href: '/settings/billing/bank-accounts',
      validation: validation?.bankAccounts,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'codes',
      title: 'Billing Codes',
      description: 'CPT, ICD-10 and modifier code libraries',
      icon: FileText,
      href: '/settings/billing/codes',
      validation: validation ? {
        ready: validation.cptCodes.ready && validation.icdCodes.ready,
        count: validation.cptCodes.count + validation.icdCodes.count
      } : null,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'payers',
      title: 'Insurance Payers',
      description: 'Medicare, Medicaid, commercial insurance networks',
      icon: Building2,
      href: '/settings/billing/payers',
      validation: validation?.payers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'providers',
      title: 'Healthcare Providers',
      description: 'NPI registry for billing, rendering & referring providers',
      icon: Users,
      href: '/settings/billing/providers',
      validation: null, // No validation for providers
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'fee-schedules',
      title: 'Fee Schedules',
      description: 'Payer-specific pricing and rate tables',
      icon: DollarSign,
      href: '/settings/billing/fee-schedules',
      validation: validation?.feeSchedules,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'payment-gateways',
      title: 'Payment Gateways',
      description: 'Stripe, SePay, Square integration for online payments',
      icon: CreditCard,
      href: '/settings/billing/payment-gateways',
      validation: validation?.paymentGateways,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'settings',
      title: 'Billing Configuration',
      description: 'ClaimMD integration, approval thresholds & statement settings',
      icon: SettingsIcon,
      href: '/settings/billing/settings',
      validation: validation?.billingSettings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Billing & Accounting Masters
              </h1>
              <p className="mt-2 text-gray-600">
                Configure chart of accounts, billing codes, payers, and payment processing
              </p>
            </div>

            {/* Progress Badge */}
            {!loading && progress && (
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-600 mb-1">Setup Progress</div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {progress.progress}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {progress.completedSections} of {progress.totalSections} sections complete
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Overall Status */}
            {validation && (
              <div className={`mb-8 rounded-lg border-2 p-6 ${
                validation.overallReady
                  ? 'border-green-200 bg-green-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-start gap-4">
                  {validation.overallReady ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      validation.overallReady ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {validation.overallReady
                        ? 'Master Data Setup Complete'
                        : 'Master Data Setup In Progress'}
                    </h3>
                    <p className={`mt-1 text-sm ${
                      validation.overallReady ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {validation.overallReady
                        ? 'All required master data is configured. Your billing system is ready for transactions.'
                        : 'Complete the setup sections below to enable full billing and accounting functionality.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Setup Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => {
                const isReady = section.validation?.ready;
                const count = section.validation?.count;

                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    className="group block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${section.bgColor}`}>
                          <section.icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        
                        {section.validation !== null && (
                          <div className="flex items-center gap-2">
                            {isReady ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {section.description}
                      </p>

                      {/* Stats */}
                      {count !== undefined && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Records</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex items-center justify-end mt-4 text-sm text-blue-600 group-hover:text-blue-700">
                        Configure
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats */}
            {validation && (
              <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Master Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Chart of Accounts</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {validation.chartOfAccounts.count}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {validation.chartOfAccounts.activeAccounts} active
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Billing Codes</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(validation.cptCodes.count + validation.icdCodes.count).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {validation.cptCodes.count} CPT + {validation.icdCodes.count} ICD
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Insurance Payers</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {validation.payers.count}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      All types configured
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Fee Schedules</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {validation.feeSchedules.count}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {validation.feeSchedules.cptCodesWithFees} codes priced
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
