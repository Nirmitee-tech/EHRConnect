'use client';

import React, { useState } from 'react';
import { CreditCard, ChevronUp, ChevronDown, Edit, Plus, X, Image as ImageIcon } from 'lucide-react';
import { InsuranceData } from '@/types/encounter';
import { InsuranceDrawer } from './insurance-drawer';

interface InsuranceSectionProps {
  insuranceCards?: InsuranceData[];
  onUpdate?: (cards: InsuranceData[]) => Promise<void>;
}

export function InsuranceSection({ insuranceCards = [], onUpdate }: InsuranceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCard, setEditingCard] = useState<InsuranceData | null>(null);

  // Get primary insurance for quick display
  const primaryInsurance = insuranceCards.find(card => card.isPrimary && card.isActive);
  const activeInsurances = insuranceCards.filter(card => card.isActive);

  const handleEdit = (card?: InsuranceData) => {
    setEditingCard(card || null);
    setShowDrawer(true);
  };

  const handleSave = async (insurance: InsuranceData) => {
    try {
      let updatedCards: InsuranceData[];

      if (editingCard) {
        // Update existing
        updatedCards = insuranceCards.map(card =>
          card.id === editingCard.id ? insurance : card
        );
      } else {
        // Add new
        updatedCards = [...insuranceCards, insurance];
      }

      if (onUpdate) {
        await onUpdate(updatedCards);
      }

      setShowDrawer(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Failed to save insurance:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insurance?')) return;

    try {
      const updatedCards = insuranceCards.filter(card => card.id !== id);
      if (onUpdate) {
        await onUpdate(updatedCards);
      }
    } catch (error) {
      console.error('Failed to delete insurance:', error);
      alert('Failed to delete insurance');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-600 text-white';
      case 'secondary': return 'bg-purple-100 text-purple-700';
      case 'tertiary': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <InsuranceDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingCard(null);
        }}
        insurance={editingCard}
        onSave={handleSave}
      />
    <div className="border-b border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
          <h3 className="text-xs font-semibold text-blue-900">
            Insurance ({activeInsurances.length})
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {isEditing ? (
            // Edit Form
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-900">
                  {editingCard ? 'Edit Insurance' : 'Add Insurance'}
                </h4>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingCard(null);
                    setFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Type & Coverage */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Type *</label>
                  <select
                    value={formData.type || 'primary'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="tertiary">Tertiary</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Coverage</label>
                  <select
                    value={formData.coverageType || 'medical'}
                    onChange={(e) => setFormData({ ...formData, coverageType: e.target.value as any })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="medical">Medical</option>
                    <option value="dental">Dental</option>
                    <option value="vision">Vision</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Plan Type *</label>
                <select
                  value={formData.plan || 'PPO'}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PPO">PPO</option>
                  <option value="HMO">HMO</option>
                  <option value="EPO">EPO</option>
                  <option value="POS">POS</option>
                  <option value="HDHP">HDHP</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Provider */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Insurance Provider *</label>
                <input
                  type="text"
                  value={formData.provider || ''}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Blue Cross Blue Shield"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Member ID & Group Number */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Member ID *</label>
                  <input
                    type="text"
                    value={formData.memberId || ''}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    placeholder="Member/Policy ID"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Group #</label>
                  <input
                    type="text"
                    value={formData.groupNumber || ''}
                    onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Subscriber Name */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Subscriber Name *</label>
                <input
                  type="text"
                  value={formData.subscriberName || ''}
                  onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })}
                  placeholder="Primary policyholder"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Relationship</label>
                <select
                  value={formData.relationship || 'self'}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Rx Info (for pharmacy coverage) */}
              {formData.coverageType === 'pharmacy' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Rx BIN</label>
                    <input
                      type="text"
                      value={formData.rxBin || ''}
                      onChange={(e) => setFormData({ ...formData, rxBin: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Rx PCN</label>
                    <input
                      type="text"
                      value={formData.rxPcn || ''}
                      onChange={(e) => setFormData({ ...formData, rxPcn: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Rx Group</label>
                    <input
                      type="text"
                      value={formData.rxGroup || ''}
                      onChange={(e) => setFormData({ ...formData, rxGroup: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  <Check className="inline h-3 w-3 mr-1" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingCard(null);
                    setFormData({});
                  }}
                  className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display insurances
            <>
              {activeInsurances.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No insurance on record</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {activeInsurances.map((insurance) => (
                    <div
                      key={insurance.id}
                      className={`p-2 rounded text-xs border ${
                        insurance.isPrimary
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {insurance.isPrimary && (
                            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-600 text-white">
                              Primary
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getPlanBadgeColor(insurance.plan)}`}>
                            {insurance.plan}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 capitalize">
                            {insurance.coverageType}
                          </span>
                          {insurance.verificationStatus && (
                            <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getStatusColor(insurance.verificationStatus)}`}>
                              {insurance.verificationStatus === 'verified' ? 'Verified' :
                               insurance.verificationStatus === 'pending' ? 'Pending' :
                               insurance.verificationStatus === 'failed' ? 'Failed' : 'Not Verified'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(insurance)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(insurance.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Insurance Details */}
                      <div className="space-y-1 text-gray-700">
                        <div className="font-semibold">{insurance.provider}</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                          <div>
                            <span className="text-gray-500">Member ID:</span>
                            <span className="ml-1 font-medium">{insurance.memberId}</span>
                          </div>
                          {insurance.groupNumber && (
                            <div>
                              <span className="text-gray-500">Group:</span>
                              <span className="ml-1 font-medium">{insurance.groupNumber}</span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-gray-500">Subscriber:</span>
                            <span className="ml-1 font-medium">{insurance.subscriberName}</span>
                            <span className="ml-1 text-gray-500 capitalize">({insurance.relationship})</span>
                          </div>
                        </div>

                        {/* Rx Info */}
                        {(insurance.rxBin || insurance.rxPcn || insurance.rxGroup) && (
                          <div className="pt-1 mt-1 border-t border-gray-200">
                            <div className="text-gray-500 text-xs font-semibold mb-0.5">Pharmacy Benefits:</div>
                            <div className="grid grid-cols-3 gap-2">
                              {insurance.rxBin && <div><span className="text-gray-500">BIN:</span> {insurance.rxBin}</div>}
                              {insurance.rxPcn && <div><span className="text-gray-500">PCN:</span> {insurance.rxPcn}</div>}
                              {insurance.rxGroup && <div><span className="text-gray-500">Group:</span> {insurance.rxGroup}</div>}
                            </div>
                          </div>
                        )}

                        {/* Copay Info */}
                        {insurance.copay && (
                          <div className="pt-1 mt-1 border-t border-gray-200">
                            <div className="text-gray-500 text-xs font-semibold mb-0.5">Copays:</div>
                            <div className="grid grid-cols-2 gap-x-2">
                              {insurance.copay.primaryCare && <div>PCP: ${insurance.copay.primaryCare}</div>}
                              {insurance.copay.specialist && <div>Specialist: ${insurance.copay.specialist}</div>}
                              {insurance.copay.emergency && <div>ER: ${insurance.copay.emergency}</div>}
                              {insurance.copay.urgentCare && <div>Urgent: ${insurance.copay.urgentCare}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleEdit()}
                className="mt-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                {activeInsurances.length === 0 ? 'Add Insurance' : 'Add Another Insurance'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
