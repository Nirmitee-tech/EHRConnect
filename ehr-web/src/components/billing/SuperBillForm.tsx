'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, X, Printer, Save, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { BillingItem, ICD10Code, Provider, SuperBillFormData } from '@/types/super-bill';
import { cn } from '@/lib/utils';

interface SuperBillFormProps {
  patientId: string;
  patientName: string;
  patientDetails?: {
    gender?: string;
    dob?: string;
    contactNumber?: string;
    address?: string;
  };
  insurance?: {
    insuranceType?: string;
    payerName?: string;
    planName?: string;
    insuranceIdNumber?: string;
    groupId?: string;
    effectiveEndDate?: string;
    eligibility?: string;
  };
  primaryProvider?: {
    firstName?: string;
    lastName?: string;
    npiNumber?: string;
    contactNumber?: string;
    emailId?: string;
    address?: string;
  };
  availableProviders?: Provider[];
  onBack?: () => void;
  onSave?: (data: SuperBillFormData) => void;
  onSaveDraft?: (data: SuperBillFormData) => void;
  onPrint?: (data: SuperBillFormData) => void;
}

// Mock ICD10 codes - in real app, this would come from API
const MOCK_ICD10_CODES: ICD10Code[] = [
  { id: '1', code: 'F43.23', description: 'Adjustment disorder with mixed anxiety and depressed mood' },
  { id: '2', code: 'F33.1', description: 'Major depressive disorder, recurrent, moderate' },
  { id: '3', code: 'F41.1', description: 'Generalized anxiety disorder' },
  { id: '4', code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
  { id: '5', code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
  { id: '6', code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { id: '7', code: 'M25.50', description: 'Pain in unspecified joint' },
  { id: '8', code: 'R51', description: 'Headache' },
  { id: '9', code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { id: '10', code: 'I10', description: 'Essential (primary) hypertension' },
];

export function SuperBillForm({
  patientId,
  patientName,
  patientDetails,
  insurance,
  primaryProvider,
  availableProviders = [],
  onBack,
  onSave,
  onSaveDraft,
  onPrint
}: SuperBillFormProps) {
  const [billingProviderId, setBillingProviderId] = useState('');
  const [referringProviderId, setReferringProviderId] = useState('');
  const [orderingProviderId, setOrderingProviderId] = useState('');
  const [billingItems, setBillingItems] = useState<BillingItem[]>([
    {
      id: '1',
      procedureCode: '',
      modifiers: '',
      amount: 0,
      quantity: 1,
      subtotal: 0,
      icd10Codes: []
    }
  ]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Calculate totals
  const { proceduralCharges, totalCharges } = useMemo(() => {
    const procedural = billingItems.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      proceduralCharges: procedural,
      totalCharges: procedural
    };
  }, [billingItems]);

  const addBillingItem = () => {
    const newItem: BillingItem = {
      id: Date.now().toString(),
      procedureCode: '',
      modifiers: '',
      amount: 0,
      quantity: 1,
      subtotal: 0,
      icd10Codes: []
    };
    setBillingItems([...billingItems, newItem]);
  };

  const removeBillingItem = (id: string) => {
    setBillingItems(billingItems.filter(item => item.id !== id));
  };

  const updateBillingItem = (id: string, field: keyof BillingItem, value: any) => {
    setBillingItems(billingItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-calculate subtotal
        if (field === 'amount' || field === 'quantity') {
          updated.subtotal = updated.amount * updated.quantity;
        }
        return updated;
      }
      return item;
    }));
  };

  const addICD10Code = (itemId: string, code: ICD10Code) => {
    setBillingItems(billingItems.map(item => {
      if (item.id === itemId) {
        // Don't add duplicate
        if (item.icd10Codes.some(c => c.code === code.code)) {
          return item;
        }
        return {
          ...item,
          icd10Codes: [...item.icd10Codes, code]
        };
      }
      return item;
    }));
  };

  const removeICD10Code = (itemId: string, codeId: string) => {
    setBillingItems(billingItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          icd10Codes: item.icd10Codes.filter(c => c.id !== codeId)
        };
      }
      return item;
    }));
  };

  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    const data: SuperBillFormData = {
      patientId,
      billingProviderId,
      referringProviderId,
      orderingProviderId,
      billingItems
    };
    onSave?.(data);
  };

  const handleSaveDraft = () => {
    const data: SuperBillFormData = {
      patientId,
      billingProviderId,
      referringProviderId,
      orderingProviderId,
      billingItems
    };
    onSaveDraft?.(data);
  };

  const handlePrint = () => {
    const data: SuperBillFormData = {
      patientId,
      billingProviderId,
      referringProviderId,
      orderingProviderId,
      billingItems
    };
    onPrint?.(data);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-base font-bold text-gray-900">Create Super Bill</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {patientName} <span className="text-gray-400">•</span> {patientId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                Save Draft
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Save Bill
              </button>
            </div>
          </div>

          {/* Provider Information - Ultra Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xs font-semibold text-gray-900 mb-2">Provider Information</h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Billing Provider */}
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-600">
                  Billing Provider
                </label>
                <select
                  value={billingProviderId}
                  onChange={(e) => setBillingProviderId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Provider</option>
                  {availableProviders.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {billingProviderId && (
                  <p className="text-[10px] text-gray-500">
                    NPI: <span className="font-medium text-gray-700">
                      {availableProviders.find(p => p.id === billingProviderId)?.npiNumber}
                    </span>
                  </p>
                )}
              </div>

              {/* Referring Provider */}
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-600">
                  Referring Provider
                </label>
                <select
                  value={referringProviderId}
                  onChange={(e) => setReferringProviderId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Provider</option>
                  {availableProviders.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {referringProviderId && (
                  <p className="text-[10px] text-gray-500">
                    NPI: <span className="font-medium text-gray-700">
                      {availableProviders.find(p => p.id === referringProviderId)?.npiNumber}
                    </span>
                  </p>
                )}
              </div>

              {/* Ordering Provider */}
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-600">
                  Ordering Provider
                </label>
                <select
                  value={orderingProviderId}
                  onChange={(e) => setOrderingProviderId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Provider</option>
                  {availableProviders.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {orderingProviderId && (
                  <p className="text-[10px] text-gray-500">
                    NPI: <span className="font-medium text-gray-700">
                      {availableProviders.find(p => p.id === orderingProviderId)?.npiNumber}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coding Section - Ultra Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xs font-semibold text-gray-900 mb-2">Coding</h2>

            <div className="space-y-2">
              {billingItems.map((item, index) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <div key={item.id} className="border border-gray-200 rounded-md overflow-hidden">
                    {/* Billing Item Row */}
                    <div className="bg-gray-50 px-2 py-2">
                      <div className="flex items-center gap-2">
                        {/* Row Number */}
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded text-[10px] font-bold flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Fields Grid */}
                        <div className="flex-1 grid grid-cols-12 gap-2 items-end">
                          {/* Procedure */}
                          <div className="col-span-2">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              Procedure
                            </label>
                            <input
                              type="text"
                              value={item.procedureCode}
                              onChange={(e) => updateBillingItem(item.id, 'procedureCode', e.target.value)}
                              placeholder="90834"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Modifiers */}
                          <div className="col-span-2">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              Modifiers
                            </label>
                            <input
                              type="text"
                              value={item.modifiers}
                              onChange={(e) => updateBillingItem(item.id, 'modifiers', e.target.value)}
                              placeholder="AO"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Amount */}
                          <div className="col-span-2">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              Amount ($)
                            </label>
                            <input
                              type="number"
                              value={item.amount || ''}
                              onChange={(e) => updateBillingItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="202.00"
                              step="0.01"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-1">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              Qty
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateBillingItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              Subtotal ($)
                            </label>
                            <div className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded text-blue-900 font-semibold">
                              {item.subtotal.toFixed(2)}
                            </div>
                          </div>

                          {/* ICD Button */}
                          <div className="col-span-2">
                            <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                              ICD Codes
                            </label>
                            <button
                              onClick={() => toggleItemExpanded(item.id)}
                              className="w-full px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                            >
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {item.icd10Codes.length} ICD
                            </button>
                          </div>

                          {/* Delete */}
                          <div className="col-span-1 flex items-end">
                            {billingItems.length > 1 && (
                              <button
                                onClick={() => removeBillingItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ICD10 Codes Section - Expandable */}
                    {isExpanded && (
                      <div className="bg-white px-2 py-2 border-t border-gray-200 space-y-1.5">
                        {/* Selected ICD10 Codes */}
                        {item.icd10Codes.map((code, idx) => (
                          <div key={code.id} className="flex items-center gap-2 text-[10px] bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
                            <span className="flex items-center justify-center w-4 h-4 bg-gray-300 text-gray-700 rounded-sm text-[9px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-gray-900">{code.code}</span>
                            <span className="flex-1 text-gray-600">{code.description}</span>
                            <button
                              onClick={() => removeICD10Code(item.id, code.id)}
                              className="p-0.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add ICD10 Code Dropdown */}
                        <select
                          onChange={(e) => {
                            const code = MOCK_ICD10_CODES.find(c => c.id === e.target.value);
                            if (code) {
                              addICD10Code(item.id, code);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-2 py-1.5 text-[10px] border border-dashed border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-600 bg-white"
                        >
                          <option value="">+ Add ICD10 Code</option>
                          {MOCK_ICD10_CODES.map(code => (
                            <option key={code.id} value={code.id}>
                              {code.code} - {code.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Billing Item Button */}
              <button
                onClick={addBillingItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Billing Item
              </button>
            </div>
          </div>

          {/* Charges Summary - Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xs font-semibold text-gray-900 mb-2">Charges</h2>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Procedural Charges</span>
                <span className="font-semibold text-gray-900">${proceduralCharges.toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total Charges</span>
                <span className="text-base font-bold text-blue-600">${totalCharges.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Patient & Provider Details */}
      <div className="w-72 border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Patient Details */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-blue-600 rounded">
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-blue-900">Patient Details</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-blue-700">Patient ID</span>
                <span className="font-semibold text-blue-900">{patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Name</span>
                <span className="font-semibold text-blue-900">{patientName}</span>
              </div>
              {patientDetails?.gender && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Gender</span>
                  <span className="font-semibold text-blue-900">{patientDetails.gender}</span>
                </div>
              )}
              {patientDetails?.dob && (
                <div className="flex justify-between">
                  <span className="text-blue-700">DOB</span>
                  <span className="font-semibold text-blue-900">{patientDetails.dob}</span>
                </div>
              )}
              {patientDetails?.contactNumber && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Contact</span>
                  <span className="font-semibold text-blue-900">{patientDetails.contactNumber}</span>
                </div>
              )}
              {patientDetails?.address && (
                <div className="pt-1.5 border-t border-blue-300">
                  <span className="text-blue-700">Address</span>
                  <p className="font-semibold text-blue-900 mt-1">{patientDetails.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Insurance Information */}
          {insurance && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-green-600 rounded">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-green-900">Insurance Information</h3>
              </div>
              <div className="space-y-1.5 text-[10px]">
                {insurance.insuranceType && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Type</span>
                    <span className="font-semibold text-green-900">{insurance.insuranceType}</span>
                  </div>
                )}
                {insurance.payerName && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Payer</span>
                    <span className="font-semibold text-green-900">{insurance.payerName}</span>
                  </div>
                )}
                {insurance.planName && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Plan</span>
                    <span className="font-semibold text-green-900">{insurance.planName}</span>
                  </div>
                )}
                {insurance.insuranceIdNumber && (
                  <div className="flex justify-between">
                    <span className="text-green-700">ID Number</span>
                    <span className="font-semibold text-green-900">{insurance.insuranceIdNumber}</span>
                  </div>
                )}
                {insurance.groupId && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Group ID</span>
                    <span className="font-semibold text-green-900">{insurance.groupId}</span>
                  </div>
                )}
                {insurance.effectiveEndDate && (
                  <div className="flex justify-between">
                    <span className="text-green-700">End Date</span>
                    <span className="font-semibold text-green-900">{insurance.effectiveEndDate}</span>
                  </div>
                )}
                {insurance.eligibility && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Eligibility</span>
                    <span className="font-semibold text-green-900">{insurance.eligibility}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Provider Details */}
          {primaryProvider && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-purple-600 rounded">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-purple-900">Primary Provider</h3>
              </div>
              <div className="space-y-1.5 text-[10px]">
                {(primaryProvider.firstName || primaryProvider.lastName) && (
                  <div className="flex justify-between">
                    <span className="text-purple-700">Name</span>
                    <span className="font-semibold text-purple-900">
                      {primaryProvider.firstName} {primaryProvider.lastName}
                    </span>
                  </div>
                )}
                {primaryProvider.npiNumber && (
                  <div className="flex justify-between">
                    <span className="text-purple-700">NPI</span>
                    <span className="font-semibold text-purple-900">{primaryProvider.npiNumber}</span>
                  </div>
                )}
                {primaryProvider.contactNumber && (
                  <div className="flex justify-between">
                    <span className="text-purple-700">Contact</span>
                    <span className="font-semibold text-purple-900">{primaryProvider.contactNumber}</span>
                  </div>
                )}
                {primaryProvider.emailId && (
                  <div className="flex justify-between">
                    <span className="text-purple-700">Email</span>
                    <span className="font-semibold text-purple-900 truncate">{primaryProvider.emailId}</span>
                  </div>
                )}
                {primaryProvider.address && (
                  <div className="pt-1.5 border-t border-purple-300">
                    <span className="text-purple-700">Address</span>
                    <p className="font-semibold text-purple-900 mt-1">{primaryProvider.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
