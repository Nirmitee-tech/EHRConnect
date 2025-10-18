'use client';

import React, { useState } from 'react';
import { CreditCard, ChevronUp, ChevronDown, Edit, Plus, X, Image as ImageIcon } from 'lucide-react';
import type { InsuranceData } from '@/types/encounter';
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
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded capitalize ${getTypeBadgeColor(insurance.type)}`}>
                          {insurance.type}
                        </span>
                        {insurance.verificationStatus && (
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getStatusColor(insurance.verificationStatus)}`}>
                            {insurance.verificationStatus === 'verified' ? '✓ Verified' :
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
                      <div className="font-semibold">{insurance.insuranceName}</div>
                      {insurance.planName && (
                        <div className="text-gray-600">{insurance.planName}</div>
                      )}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <div>
                          <span className="text-gray-500">Member ID:</span>
                          <span className="ml-1 font-medium">{insurance.memberId}</span>
                        </div>
                        {insurance.groupId && (
                          <div>
                            <span className="text-gray-500">Group ID:</span>
                            <span className="ml-1 font-medium">{insurance.groupId}</span>
                          </div>
                        )}
                        {insurance.groupName && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Group:</span>
                            <span className="ml-1 font-medium">{insurance.groupName}</span>
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="text-gray-500">Relationship:</span>
                          <span className="ml-1 font-medium capitalize">{insurance.relationship}</span>
                        </div>
                      </div>

                      {/* Card Images */}
                      {(insurance.cardFrontImage || insurance.cardBackImage) && (
                        <div className="pt-1 mt-1 border-t border-gray-200">
                          <div className="text-gray-500 text-xs font-semibold mb-1">Insurance Card:</div>
                          <div className="flex gap-2">
                            {insurance.cardFrontImage && (
                              <div className="flex-1">
                                <img
                                  src={insurance.cardFrontImage}
                                  alt="Front of card"
                                  className="w-full h-auto rounded border border-gray-200 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(insurance.cardFrontImage, '_blank')}
                                />
                                <p className="text-xs text-gray-500 text-center mt-0.5">Front</p>
                              </div>
                            )}
                            {insurance.cardBackImage && (
                              <div className="flex-1">
                                <img
                                  src={insurance.cardBackImage}
                                  alt="Back of card"
                                  className="w-full h-auto rounded border border-gray-200 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(insurance.cardBackImage, '_blank')}
                                />
                                <p className="text-xs text-gray-500 text-center mt-0.5">Back</p>
                              </div>
                            )}
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
          </div>
        )}
      </div>
    </>
  );
}
