'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, ChevronDown, ChevronUp, Check, Shield, User, CreditCard, Phone, MapPin, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';

interface InsuranceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InsuranceFormData) => void;
  patientId: string;
}

export interface InsuranceFormData {
  insuranceProvider: string;
  policyNumber: string;
  planName: string;
  insuranceOrder: 'primary' | 'secondary' | 'tertiary';
  subscriberName: string;
  subscriberDob: string;
  relationship: string;
  providerPhone: string;
  payerId: string;
  claimsAddress: string;
  copayAmount: string;
  coinsurancePercentage: string;
  deductibleAmount: string;
  deductibleMet: string;
  outOfPocketMax: string;
  authorizationNumber: string;
  authorizationRequired: boolean;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'expired';
  verified: boolean;
  active: boolean;
  notes: string;
}

export function InsuranceDrawer({ open, onOpenChange, onSave, patientId }: InsuranceDrawerProps) {
  const [formData, setFormData] = useState<InsuranceFormData>({
    insuranceProvider: '',
    policyNumber: '',
    planName: '',
    insuranceOrder: 'primary',
    subscriberName: '',
    subscriberDob: '',
    relationship: 'self',
    providerPhone: '',
    payerId: '',
    claimsAddress: '',
    copayAmount: '',
    coinsurancePercentage: '',
    deductibleAmount: '',
    deductibleMet: '',
    outOfPocketMax: '',
    authorizationNumber: '',
    authorizationRequired: false,
    verificationStatus: 'pending',
    verified: false,
    active: true,
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [filteredPayers, setFilteredPayers] = useState<any[]>([]);
  const [loadingPayers, setLoadingPayers] = useState(false);
  const [payersError, setPayersError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [expandedSection, setExpandedSection] = useState<string>('basic');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchPayers = async (search: string) => {
    if (!search || search.length < 2) {
      setFilteredPayers([]);
      return;
    }

    setLoadingPayers(true);
    setPayersError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/integrations/claimmd/payers?search=${encodeURIComponent(search)}`
      );
      const data = await response.json();

      if (data.success) {
        setFilteredPayers(data.payers);
        if (data.payers.length === 0) {
          setPayersError('No payers found matching your search');
        }
      } else {
        setPayersError(data.error || 'Failed to load payers');
      }
    } catch (error) {
      console.error('Error fetching payers:', error);
      setPayersError('Failed to connect to payer service');
    } finally {
      setLoadingPayers(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only search if we have at least 2 characters
    if (searchTerm.length >= 2) {
      setLoadingPayers(true); // Show loading immediately for better UX
      debounceTimerRef.current = setTimeout(() => {
        searchPayers(searchTerm);
      }, 400); // 400ms debounce for smoother experience
    } else {
      // Clear results and errors when search term is too short
      setFilteredPayers([]);
      setPayersError(null);
      setLoadingPayers(false);
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof InsuranceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPayer = (payer: any) => {
    setFormData(prev => ({
      ...prev,
      insuranceProvider: payer.payerName,
      payerId: payer.payerId || payer.electronicPayerId || '',
      providerPhone: payer.phone || ''
    }));
    setSearchTerm(payer.payerName);
    setShowProviderDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFillDemo = () => {
    setFormData({
      insuranceProvider: 'Aetna',
      policyNumber: 'AETNA12345678',
      planName: 'Aetna Choice POS II',
      insuranceOrder: 'primary',
      subscriberName: 'John Doe',
      subscriberDob: '1985-05-15',
      relationship: 'self',
      providerPhone: '1-800-123-4567',
      payerId: 'AETNA001',
      claimsAddress: '151 Farmington Avenue, Hartford, CT 06156',
      copayAmount: '25',
      coinsurancePercentage: '20',
      deductibleAmount: '1500',
      deductibleMet: '750',
      outOfPocketMax: '5000',
      authorizationNumber: 'AUTH123456',
      authorizationRequired: true,
      verificationStatus: 'verified',
      verified: true,
      active: true,
      notes: 'Patient has met 50% of deductible. Pre-authorization required for specialist visits.'
    });
    setSearchTerm('Aetna');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const AccordionSection = ({
    id,
    title,
    icon: Icon,
    children,
    required = false
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    required?: boolean;
  }) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            isExpanded
              ? 'bg-gray-50'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-600" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {title}
                </span>
                {required && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </button>
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="xl" className="overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Add Insurance Coverage</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white">
          {/* Basic Information */}
          <AccordionSection id="basic" title="Basic Information" icon={CreditCard} required>
            <div className="space-y-3">
              {/* Insurance Provider Search */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Insurance Provider <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      // Only show dropdown if we have 2+ characters or we have results
                      if (value.length >= 2 || (value.length < 2 && filteredPayers.length > 0)) {
                        setShowProviderDropdown(true);
                      } else {
                        setShowProviderDropdown(false);
                      }
                    }}
                    onFocus={() => {
                      // Only show dropdown if we have 2+ characters and results/errors to show
                      if (searchTerm.length >= 2 && (filteredPayers.length > 0 || payersError)) {
                        setShowProviderDropdown(true);
                      }
                    }}
                    placeholder="Type at least 2 characters to search..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {loadingPayers ? (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {showProviderDropdown && !loadingPayers && searchTerm.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {payersError ? (
                      <div className="p-4 text-center">
                        <div className="inline-flex p-2 bg-red-100 rounded-full mb-2">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                        <p className="text-sm text-red-600 font-medium">{payersError}</p>
                        {payersError.includes('No payers found') ? null : (
                          <p className="text-xs text-gray-500 mt-1">Make sure the EHR API is running on port 8000</p>
                        )}
                      </div>
                    ) : filteredPayers.length > 0 ? (
                      <div className="py-1">
                        {filteredPayers.slice(0, 50).map((payer, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPayer(payer)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {payer.payerName}
                                </div>
                                {payer.payerId && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Payer ID: {payer.payerId}
                                  </div>
                                )}
                              </div>
                              {formData.payerId === payer.payerId && (
                                <div className="flex-shrink-0 ml-2">
                                  <Check className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                        {filteredPayers.length > 50 && (
                          <div className="px-3 py-2 text-xs text-center bg-gray-50 text-gray-600 border-t border-gray-200">
                            Showing 50 of {filteredPayers.length} results. Refine your search for more specific results.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No payers found matching your search</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {loadingPayers ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Searching Claim.MD database...
                    </>
                  ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
                    'Type at least 2 characters to search'
                  ) : (
                    'Search payers from Claim.MD database'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Policy Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => handleChange('policyNumber', e.target.value)}
                    placeholder="Enter policy number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => handleChange('planName', e.target.value)}
                    placeholder="e.g., PPO, HMO, EPO"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Insurance Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.insuranceOrder}
                    onChange={(e) => handleChange('insuranceOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    required
                  >
                    <option value="primary">Primary Insurance</option>
                    <option value="secondary">Secondary Insurance</option>
                    <option value="tertiary">Tertiary Insurance</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Subscriber Information */}
          <AccordionSection id="subscriber" title="Subscriber Information" icon={User}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subscriber Name
                </label>
                <input
                  type="text"
                  value={formData.subscriberName}
                  onChange={(e) => handleChange('subscriberName', e.target.value)}
                  placeholder="Full name of subscriber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.subscriberDob}
                  onChange={(e) => handleChange('subscriberDob', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Relationship to Patient
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </AccordionSection>

          {/* Contact Information */}
          <AccordionSection id="contact" title="Contact Information" icon={Phone}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Provider Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.providerPhone}
                    onChange={(e) => handleChange('providerPhone', e.target.value)}
                    placeholder="1-800-123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payer ID
                  </label>
                  <input
                    type="text"
                    value={formData.payerId}
                    onChange={(e) => handleChange('payerId', e.target.value)}
                    placeholder="Unique payer identifier"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Claims Address
                </label>
                <textarea
                  value={formData.claimsAddress}
                  onChange={(e) => handleChange('claimsAddress', e.target.value)}
                  placeholder="Enter claims mailing address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Coverage Details */}
          <AccordionSection id="coverage" title="Coverage Details" icon={DollarSign}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Copay Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.copayAmount}
                  onChange={(e) => handleChange('copayAmount', e.target.value)}
                  placeholder="25.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Coinsurance (%)
                </label>
                <input
                  type="number"
                  value={formData.coinsurancePercentage}
                  onChange={(e) => handleChange('coinsurancePercentage', e.target.value)}
                  placeholder="20"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deductible Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.deductibleAmount}
                  onChange={(e) => handleChange('deductibleAmount', e.target.value)}
                  placeholder="1500.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deductible Met ($)
                </label>
                <input
                  type="number"
                  value={formData.deductibleMet}
                  onChange={(e) => handleChange('deductibleMet', e.target.value)}
                  placeholder="750.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Out of Pocket Max ($)
                </label>
                <input
                  type="number"
                  value={formData.outOfPocketMax}
                  onChange={(e) => handleChange('outOfPocketMax', e.target.value)}
                  placeholder="5000.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Authorization */}
          <AccordionSection id="authorization" title="Authorization" icon={FileText}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Authorization Number
                </label>
                <input
                  type="text"
                  value={formData.authorizationNumber}
                  onChange={(e) => handleChange('authorizationNumber', e.target.value)}
                  placeholder="AUTH123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.authorizationRequired}
                    onChange={(e) => handleChange('authorizationRequired', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Authorization Required for Services</span>
                </label>
              </div>
            </div>
          </AccordionSection>

          {/* Status & Verification */}
          <AccordionSection id="status" title="Status & Verification" icon={CheckCircle}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Verification Status
                </label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => handleChange('verificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="pending">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Verification Failed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => handleChange('verified', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Insurance Verified</span>
                  </label>
                </div>

                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Coverage Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes or comments about this insurance coverage..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fill Demo Data
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                Save Insurance
              </button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
